using Fynanceo.API.Data;
using Fynanceo.API.Models.DTOs;
using Fynanceo.API.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Fynanceo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DeliveriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DeliveriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Deliveries
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DeliveryDTO>>> GetDeliveries(
            [FromQuery] string status = null,
            [FromQuery] DateTime? date = null,
            [FromQuery] string type = null)
        {
            var query = _context.Deliveries
                .Include(d => d.Order)
                    .ThenInclude(o => o.Customer)
                .Include(d => d.Order)
                    .ThenInclude(o => o.User)
                .Include(d => d.Order)
                    .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(d => d.Status == status);

            if (!string.IsNullOrEmpty(type))
                query = query.Where(d => d.Order.DeliveryType == type);

            if (date.HasValue)
                query = query.Where(d => d.CreatedAt.Date == date.Value.Date);

            var deliveries = await query
                .OrderByDescending(d => d.CreatedAt)
                .Select(d => new DeliveryDTO
                {
                    Id = d.Id,
                    OrderId = d.OrderId,
                    OrderNumber = d.Order.OrderNumber,
                    CustomerName = !string.IsNullOrEmpty(d.CustomerName) ? d.CustomerName :
                                 d.Order.Customer != null ? d.Order.Customer.Name : "Cliente não identificado",
                    CustomerAddress = d.DeliveryAddress,
                    CustomerPhone = !string.IsNullOrEmpty(d.CustomerPhone) ? d.CustomerPhone :
                                  d.Order.Customer != null ? d.Order.Customer.Phone : "",
                    DeliveryPerson = d.DeliveryPerson,
                    Status = d.Status,
                    DeliveryAddress = d.DeliveryAddress,
                    DeliveryFee = d.DeliveryFee,
                    EstimatedDeliveryTime = d.EstimatedDeliveryTime,
                    ActualDeliveryTime = d.ActualDeliveryTime,
                    CreatedAt = d.CreatedAt,
                    OrderAmount = d.Order.TotalAmount,
                    OrderItems = d.Order.OrderItems.Select(oi => new OrderItemDTO
                    {
                        ProductName = oi.Product.Name,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice
                    }).ToList()
                })
                .ToListAsync();

            return Ok(deliveries);
        }

        // GET: api/Deliveries/active
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<DeliveryDTO>>> GetActiveDeliveries()
        {
            var activeStatuses = new[] { "Pendente", "EmPreparo", "EmRota", "SaiuParaEntrega" };

            var deliveries = await _context.Deliveries
                .Include(d => d.Order)
                    .ThenInclude(o => o.Customer)
                .Include(d => d.Order)
                    .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Where(d => activeStatuses.Contains(d.Status))
                .OrderBy(d => d.CreatedAt)
                .Select(d => new DeliveryDTO
                {
                    Id = d.Id,
                    OrderId = d.OrderId,
                    OrderNumber = d.Order.OrderNumber,
                    CustomerName = !string.IsNullOrEmpty(d.CustomerName) ? d.CustomerName :
                                 d.Order.Customer != null ? d.Order.Customer.Name : "Cliente não identificado",
                    CustomerAddress = d.DeliveryAddress,
                    CustomerPhone = !string.IsNullOrEmpty(d.CustomerPhone) ? d.CustomerPhone :
                                  d.Order.Customer != null ? d.Order.Customer.Phone : "",
                    DeliveryPerson = d.DeliveryPerson,
                    Status = d.Status,
                    DeliveryAddress = d.DeliveryAddress,
                    DeliveryFee = d.DeliveryFee,
                    EstimatedDeliveryTime = d.EstimatedDeliveryTime,
                    ActualDeliveryTime = d.ActualDeliveryTime,
                    CreatedAt = d.CreatedAt,
                    OrderAmount = d.Order.TotalAmount
                })
                .ToListAsync();

            return Ok(deliveries);
        }

        // POST: api/Deliveries
        [HttpPost]
        [HttpPost]
        public async Task<ActionResult<DeliveryDTO>> CreateDeliveryOrder([FromBody] CreateDeliveryOrderDTO dto)
        {
            // Log para debug
            Console.WriteLine("=== DTO RECEBIDO ===");
            Console.WriteLine(JsonSerializer.Serialize(dto));

            if (!ModelState.IsValid)
            {
                Console.WriteLine("=== ERROS DE VALIDAÇÃO ===");
                foreach (var error in ModelState.Values.SelectMany(v => v.Errors))
                {
                    Console.WriteLine($"Error: {error.ErrorMessage}");
                }
                return BadRequest(ModelState);
            }

            if (dto.Items == null || !dto.Items.Any())
                return BadRequest("O pedido deve conter ao menos um item.");

            if (dto.DeliveryInfo == null)
                return BadRequest("Informações de entrega são obrigatórias.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                Console.WriteLine("=== INICIANDO CRIAÇÃO DO PEDIDO ===");

                // Verificar se cliente existe
                if (dto.CustomerId.HasValue)
                {
                    var customerExists = await _context.Customers.AnyAsync(c => c.Id == dto.CustomerId.Value);
                    Console.WriteLine($"Cliente ID {dto.CustomerId} existe: {customerExists}");
                    if (!customerExists)
                    {
                        return BadRequest($"Cliente com ID {dto.CustomerId} não encontrado.");
                    }
                }

                // Criar o pedido
                var orderNumber = GenerateOrderNumber();
                var userId = GetCurrentUserId();
                Console.WriteLine($"OrderNumber: {orderNumber}, UserId: {userId}");

                var order = new Order
                {
                    CustomerId = dto.CustomerId,
                    UserId = userId,
                    PaymentMethod = dto.PaymentMethod,
                    Status = "Aberto",
                    IsDelivery = true,
                    DeliveryType = dto.DeliveryInfo.DeliveryType,
                    CreatedAt = DateTime.UtcNow,
                    OrderNumber = orderNumber,
                    OrderItems = new List<OrderItem>()
                };

                Console.WriteLine("=== PROCESSANDO ITENS ===");
                // Processar itens do pedido
                var (items, errors) = await ProcessOrderItems(dto.Items);
                if (errors.Any())
                {
                    Console.WriteLine("=== ERROS NOS ITENS ===");
                    foreach (var error in errors) Console.WriteLine(error);
                    return BadRequest(new { Errors = errors });
                }

                order.OrderItems = items;
                order.TotalAmount = items.Sum(i => i.TotalPrice) + dto.DeliveryInfo.DeliveryFee;
                Console.WriteLine($"TotalAmount: {order.TotalAmount}");

                _context.Orders.Add(order);
                Console.WriteLine("=== SALVANDO ORDER NO BANCO ===");
                await _context.SaveChangesAsync();
                Console.WriteLine($"Order salva com ID: {order.Id}");

                // Criar detalhes de entrega
                var delivery = new Delivery
                {
                    OrderId = order.Id,
                    DeliveryAddress = dto.DeliveryInfo.DeliveryAddress,
                    CustomerPhone = dto.DeliveryInfo.CustomerPhone,
                    CustomerName = dto.DeliveryInfo.CustomerName,
                    DeliveryFee = dto.DeliveryInfo.DeliveryFee,
                    Notes = dto.DeliveryInfo.Notes,
                    EstimatedDeliveryTime = dto.DeliveryInfo.EstimatedDeliveryTime,
                    DeliveryPerson = dto.DeliveryInfo.DeliveryPerson ?? "Não atribuído", // Garante valor padrão
                    Status = "Pendente",
                    CreatedAt = DateTime.UtcNow
                };

                Console.WriteLine("=== SALVANDO DELIVERY NO BANCO ===");
                _context.Deliveries.Add(delivery);
                await _context.SaveChangesAsync();
                Console.WriteLine($"Delivery salvo com ID: {delivery.Id}");

                await transaction.CommitAsync();
                Console.WriteLine("=== TRANSAÇÃO CONCLUÍDA ===");

                // Retornar o pedido completo
                var savedOrder = await _context.Orders
                    .Include(o => o.Customer)
                    .Include(o => o.User)
                    .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                    .Include(o => o.Delivery)
                    .FirstOrDefaultAsync(o => o.Id == order.Id);

                return Ok(MapToOrderDTO(savedOrder));
                 //return CreatedAtAction("GetCustomer", new { id = customer.Id }, customer);
            }
            catch (DbUpdateException dbEx)
            {
                await transaction.RollbackAsync();
                Console.WriteLine("=== ERRO DE BANCO DE DADOS ===");
                Console.WriteLine($"Mensagem: {dbEx.Message}");
                Console.WriteLine($"Inner Exception: {dbEx.InnerException?.Message}");
                Console.WriteLine($"Stack Trace: {dbEx.StackTrace}");
                return StatusCode(500, $"Erro ao salvar no banco: {dbEx.InnerException?.Message}");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine("=== ERRO GERAL ===");
                Console.WriteLine($"Mensagem: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }
        // PATCH: api/Deliveries/5/status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateDeliveryStatus(int id, [FromBody] UpdateDeliveryStatusDTO statusDto)
        {
            var delivery = await _context.Deliveries
                .Include(d => d.Order)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (delivery == null)
            {
                return NotFound();
            }

            delivery.Status = statusDto.Status;
            delivery.UpdatedAt = DateTime.UtcNow;

            // Atualizar status do pedido principal baseado no status da entrega
            switch (statusDto.Status)
            {
                case "EmPreparo":
                    delivery.Order.Status = "EmPreparo";
                    break;
                case "EmRota":
                case "SaiuParaEntrega":
                    delivery.Order.Status = "SaiuParaEntrega";
                    break;
                case "Entregue":
                    delivery.Order.Status = "Entregue";
                    delivery.ActualDeliveryTime = DateTime.UtcNow;
                    break;
                case "Cancelado":
                    delivery.Order.Status = "Cancelado";
                    break;
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = $"Status da entrega atualizado para: {statusDto.Status}" });
        }

        // PATCH: api/Deliveries/5/assign
        [HttpPatch("{id}/assign")]
        public async Task<IActionResult> AssignDeliveryPerson(int id, [FromBody] AssignDeliveryPersonDTO assignDto)
        {
            var delivery = await _context.Deliveries.FindAsync(id);
            if (delivery == null)
            {
                return NotFound();
            }

            delivery.DeliveryPerson = assignDto.DeliveryPerson;
            delivery.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { Message = $"Entregador atribuído: {assignDto.DeliveryPerson}" });
        }

        // GET: api/Deliveries/stats
        [HttpGet("stats")]
        public async Task<ActionResult<DeliveryStatsDTO>> GetDeliveryStats()
        {
            var today = DateTime.Today;
            var deliveries = await _context.Deliveries.ToListAsync();

            // Filtra apenas entregas que têm hora real de entrega registrada
            var validDeliveries = deliveries
                .Where(d => d.ActualDeliveryTime.HasValue && d.CreatedAt != null)
                .ToList();

            // Se não houver entregas válidas, retorna 0 como tempo médio
            var avgDeliveryTime = validDeliveries.Any()
                ? validDeliveries.Average(d => (d.ActualDeliveryTime.Value - d.CreatedAt).TotalMinutes)
                : 0;

            var stats = new DeliveryStatsDTO
            {
                TotalDeliveries = deliveries.Count,
                PendingDeliveries = deliveries.Count(d => d.Status == "Pendente"),
                InProgressDeliveries = deliveries.Count(d =>
                    d.Status == "EmPreparo" || d.Status == "EmRota" || d.Status == "SaiuParaEntrega"),
                CompletedDeliveries = deliveries.Count(d => d.Status == "Entregue"),
                TodayDeliveries = deliveries.Count(d => d.CreatedAt.Date == today),
                AverageDeliveryTime = avgDeliveryTime
            };

            return Ok(stats);
        }


        private string GenerateOrderNumber()
        {
            var todayUtc = DateTime.UtcNow.Date;
            var count = _context.Orders
                .Where(o => o.CreatedAt >= todayUtc && o.CreatedAt < todayUtc.AddDays(1))
                .Count();
            var date = DateTime.Now.ToString("yyyyMMdd");
            return $"DEL-{date}-{(count + 1).ToString().PadLeft(4, '0')}";
        }

        private int GetCurrentUserId()
        {
            // Implementar lógica para obter ID do usuário atual
            return 1; // Placeholder
        }

        private async Task<(List<OrderItem> items, List<string> errors)> ProcessOrderItems(List<CreateOrderItemDTO> dtoItems)
        {
            var items = new List<OrderItem>();
            var errors = new List<string>();

            foreach (var item in dtoItems)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null)
                {
                    errors.Add($"Produto com ID {item.ProductId} não encontrado.");
                    continue;
                }

                if (item.Quantity <= 0)
                {
                    errors.Add($"Quantidade do produto {product.Name} deve ser maior que zero.");
                    continue;
                }

                if (product.StockQuantity < item.Quantity)
                {
                    errors.Add($"Estoque insuficiente para o produto {product.Name}. Disponível: {product.StockQuantity}");
                    continue;
                }

                // Atualizar estoque
                product.StockQuantity -= item.Quantity;

                items.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TotalPrice = item.Quantity * item.UnitPrice
                });
            }

            return (items, errors);
        }

        private OrderDTO MapToOrderDTO(Order order)
        {
            return new OrderDTO
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                CustomerId = order.CustomerId,
                CustomerName = order.Customer?.Name,
                UserId = order.UserId,
                UserName = order.User?.Name,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                PaymentMethod = order.PaymentMethod,
                IsDelivery = order.IsDelivery,
                DeliveryType = order.DeliveryType,
                CreatedAt = order.CreatedAt,
                Items = order.OrderItems?.Select(oi => new OrderItemDTO
                {
                    ProductName = oi.Product?.Name,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalPrice = oi.TotalPrice
                }).ToList(),
                Delivery = order.Delivery != null ? new DeliveryDTO
                {
                    Id = order.Delivery.Id,
                    OrderId = order.Delivery.OrderId,
                    DeliveryPerson = order.Delivery.DeliveryPerson,
                    Status = order.Delivery.Status,
                    DeliveryAddress = order.Delivery.DeliveryAddress,
                    CustomerPhone = order.Delivery.CustomerPhone,
                    DeliveryFee = order.Delivery.DeliveryFee,
                    EstimatedDeliveryTime = order.Delivery.EstimatedDeliveryTime,
                    ActualDeliveryTime = order.Delivery.ActualDeliveryTime,
                    CreatedAt = order.Delivery.CreatedAt
                } : null
            };
        }
    }
}