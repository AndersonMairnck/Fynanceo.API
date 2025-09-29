using Fynanceo.API.Data;
using Fynanceo.API.Models.DTOs;
using Fynanceo.API.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Fynanceo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ✅ ENDPOINT EXISTENTE - Criar pedido COM pagamento (mantido para compatibilidade)
        [HttpPost("create")]
        public async Task<ActionResult<OrderDTO>> CreateOrder([FromBody] CreateOrderDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (dto.Items == null || !dto.Items.Any())
                return BadRequest("O pedido deve conter ao menos um item.");

            var orderNumber = GenerateOrderNumber();
            var userId = GetCurrentUserId();

            var order = new Order
            {
                CustomerId = dto.CustomerId,
                UserId = userId,
                PaymentMethod = dto.PaymentMethod,
                Status = "Aberto",
                PaymentStatus = "Paid", // Pagamento imediato
                IsDelivery = false,
                CreatedAt = DateTime.UtcNow,
                OrderNumber = orderNumber,
                DeliveryType = dto.DeliveryType,
                OrderType = dto.DeliveryType ?? "Balcao",
                OrderItems = new List<OrderItem>()
            };

            (List<OrderItem> items, List<string> errors) = await ProcessOrderItems(dto.Items);

            if (errors.Any()) return BadRequest(new { Errors = errors });

            order.OrderItems = items;
            order.TotalAmount = items.Sum(i => i.TotalPrice);

            // Registrar pagamento
            var payment = new Payment
            {
                Order = order,
                PaymentMethod = dto.PaymentMethod,
                Amount = order.TotalAmount,
                PaymentDate = DateTime.UtcNow,
                Status = "Completed"
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Orders.Add(order);
                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Recarregar com includes
                var savedOrder = await _context.Orders
                    .Include(o => o.Customer)
                    .Include(o => o.User)
                    .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                    .Include(o => o.Delivery)
                    .Include(o => o.Payments)
                    .FirstOrDefaultAsync(o => o.Id == order.Id);

                return MapToOrderDTO(savedOrder!);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Erro ao criar pedido: {ex.Message}");
            }
        }

        // 🆕 NOVO ENDPOINT - Criar pedido SEM pagamento (para mesas/balcão)
        [HttpPost("create-without-payment")]
        public async Task<ActionResult<OrderDTO>> CreateOrderWithoutPayment([FromBody] CreateOrderWithoutPaymentDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var orderNumber = GenerateOrderNumber();
            var userId = GetCurrentUserId();

            var order = new Order
            {
                CustomerId = dto.CustomerId,
                UserId = userId,
                TableNumber = dto.TableNumber,
                OrderType = dto.OrderType,
                Status = "Aberto",
                PaymentStatus = "Pending",
                IsDelivery = dto.OrderType == "Delivery",
                CreatedAt = DateTime.UtcNow,
                OrderNumber = orderNumber,
                OrderItems = new List<OrderItem>(),
                TotalAmount = 0,
                Notes = dto.Notes
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Recarregar com includes
            var savedOrder = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.User)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                .Include(o => o.Delivery)
                .Include(o => o.Payments)
                .FirstOrDefaultAsync(o => o.Id == order.Id);

            return MapToOrderDTO(savedOrder!);
        }

        // 🆕 NOVO ENDPOINT - Adicionar itens a pedido existente
        [HttpPost("{orderId}/add-items")]
        public async Task<ActionResult<OrderDTO>> AddItemsToOrder(int orderId, [FromBody] AddItemsToOrderDTO dto)
        {
            if (orderId != dto.OrderId)
                return BadRequest("ID do pedido não confere");

            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                return NotFound("Pedido não encontrado");

            // Validar se pedido pode receber itens
            if (order.Status == "Finalizado" || order.Status == "Cancelado" || order.PaymentStatus == "Paid")
                return BadRequest("Não é possível adicionar itens a um pedido finalizado, cancelado ou pago");

            // Processar novos itens
            (List<OrderItem> newItems, List<string> errors) = await ProcessOrderItems(dto.Items);

            if (errors.Any())
                return BadRequest(new { Errors = errors });

            // Adicionar itens ao pedido
            foreach (var item in newItems)
            {
                item.OrderId = orderId;
                order.OrderItems.Add(item);
            }

            // Atualizar total do pedido
            order.TotalAmount = order.OrderItems.Sum(oi => oi.TotalPrice);

            // Atualizar status se for o primeiro item
            if (order.Status == "Aberto" && newItems.Any())
            {
                order.Status = "EmAndamento";
            }

            order.ModifiedAt = DateTime.UtcNow;
            order.ModifiedByUserId = GetCurrentUserId();

            await _context.SaveChangesAsync();

            // Recarregar pedido atualizado
            var updatedOrder = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.User)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                .Include(o => o.Delivery)
                .Include(o => o.Payments)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            return MapToOrderDTO(updatedOrder!);
        }

        // 🆕 NOVO ENDPOINT - Processar pagamento do pedido
        [HttpPost("{orderId}/process-payment")]
        public async Task<ActionResult<OrderDTO>> ProcessPayment(int orderId, [FromBody] ProcessPaymentDTO dto)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                return NotFound("Pedido não encontrado");

            // Validar se pedido pode ser pago
            if (order.Status == "Finalizado" || order.Status == "Cancelado")
                return BadRequest("Não é possível processar pagamento para pedido finalizado ou cancelado");

            if (!order.OrderItems.Any())
                return BadRequest("Pedido não contém itens para pagamento");

            // Validar valor do pagamento
            if (dto.Amount < order.TotalAmount)
                return BadRequest($"Valor do pagamento ({dto.Amount}) é menor que o total do pedido ({order.TotalAmount})");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Registrar pagamento
                var payment = new Payment
                {
                    OrderId = orderId,
                    PaymentMethod = dto.PaymentMethod,
                    Amount = dto.Amount,
                    TransactionId = dto.TransactionId,
                    PaymentDate = DateTime.UtcNow,
                    Status = "Completed",
                    Notes = dto.Notes
                };

                _context.Payments.Add(payment);

                // Atualizar status do pedido
                order.PaymentMethod = dto.PaymentMethod;
                order.PaymentStatus = "Paid";
                order.Status = "Finalizado";
                order.ModifiedAt = DateTime.UtcNow;
                order.ModifiedByUserId = GetCurrentUserId();

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Recarregar pedido atualizado
                var updatedOrder = await _context.Orders
                    .Include(o => o.Customer)
                    .Include(o => o.User)
                    .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                    .Include(o => o.Delivery)
                    .Include(o => o.Payments)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                return MapToOrderDTO(updatedOrder!);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Erro ao processar pagamento: {ex.Message}");
            }
        }

        // 🆕 NOVO ENDPOINT - Listar pedidos por mesa
        [HttpGet("table/{tableNumber}")]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetOrdersByTable(int tableNumber)
        {
            var orders = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.User)
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                .Include(o => o.Delivery)
                .Include(o => o.Payments)
                .Where(o => o.TableNumber == tableNumber &&
                           o.Status != "Finalizado" &&
                           o.Status != "Cancelado")
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(MapToOrderDTO).ToList();
        }

        // 🆕 Atualizar mapeamento para incluir novos campos
        private OrderDTO MapToOrderDTO(Order o)
        {
            return new OrderDTO
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerId = o.CustomerId,
                CustomerName = o.Customer?.Name,
                UserId = o.UserId,
                UserName = o.User?.Name,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                PaymentMethod = o.PaymentMethod,
                PaymentStatus = o.PaymentStatus,
                IsDelivery = o.IsDelivery,
                TableNumber = o.TableNumber,
                OrderType = o.OrderType,
                Notes = o.Notes,
                CreatedAt = o.CreatedAt,
                ModifiedAt = o.ModifiedAt,
                Items = o.OrderItems.Select(oi => new OrderItemDTO
                {
                    Id = oi.Id,
                    OrderId = oi.OrderId,
                    ProductId = oi.ProductId,
                    ProductName = oi.Product?.Name,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalPrice = oi.TotalPrice
                }).ToList(),
                Delivery = o.Delivery != null ? new DeliveryDTO
                {
                    Id = o.Delivery.Id,
                    OrderId = o.Delivery.OrderId,
                    DeliveryPerson = o.Delivery.DeliveryPerson,
                    Status = o.Delivery.Status,
                    DeliveryAddress = o.Delivery.DeliveryAddress,
                    CustomerPhone = o.Delivery.CustomerPhone,
                    EstimatedDeliveryTime = o.Delivery.EstimatedDeliveryTime,
                    ActualDeliveryTime = o.Delivery.ActualDeliveryTime,
                    CreatedAt = o.Delivery.CreatedAt,
                    OrderNumber = o.OrderNumber,
                    CustomerName = o.Customer?.Name,
                    CustomerAddress = o.Customer?.Rua,
                    OrderAmount = o.TotalAmount,
                    OrderItems = o.OrderItems.Select(oi => new OrderItemDTO
                    {
                        Id = oi.Id,
                        OrderId = oi.OrderId,
                        ProductId = oi.ProductId,
                        ProductName = oi.Product?.Name,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice
                    }).ToList()
                } : null,
                Payments = o.Payments?.Select(p => new PaymentDTO
                {
                    Id = p.Id,
                    OrderId = p.OrderId,
                    PaymentMethod = p.PaymentMethod,
                    Amount = p.Amount,
                    TransactionId = p.TransactionId,
                    PaymentDate = p.PaymentDate,
                    Status = p.Status,
                    Notes = p.Notes
                }).ToList() ?? new List<PaymentDTO>()
            };
        }

        // 🔧 Métodos auxiliares existentes (mantidos)
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim != null && int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            return 1; // Fallback para desenvolvimento
        }

        private string GenerateOrderNumber()
        {
            // Implementação existente
            try
            {
                var todayUtc = DateTime.UtcNow.Date;
                var count = _context.Orders
                    .Where(o => o.CreatedAt >= todayUtc && o.CreatedAt < todayUtc.AddDays(1))
                    .Count();
                var date = DateTime.Now.ToString("yyyyMMdd");
                return $"PED-{date}-{(count + 1).ToString().PadLeft(4, '0')}";
            }
            catch (Exception ex)
            {
                var timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");
                return $"PED-EMG-{timestamp}";
            }
        }

        private async Task<(List<OrderItem> items, List<string> errors)> ProcessOrderItems(List<CreateOrderItemDTO> dtoItems)
        {
            // Implementação existente
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

        // ... outros métodos existentes do controller
    }
}