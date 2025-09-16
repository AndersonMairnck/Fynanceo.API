using Fynanceo.API.Data;
using Fynanceo.API.Models.DTOs;
using Fynanceo.API.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Fynanceo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Orders?status=&customerId=&startDate=&endDate=&pageNumber=1&pageSize=10
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetOrders(
            [FromQuery] string? status,
            [FromQuery] int? customerId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.Delivery)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(o => o.Status == status);

            if (customerId.HasValue)
                query = query.Where(o => o.CustomerId == customerId.Value);

            if (startDate.HasValue)
                query = query.Where(o => o.CreatedAt >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(o => o.CreatedAt <= endDate.Value);

            var totalItems = await query.CountAsync();

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            Response.Headers.Add("X-Total-Count", totalItems.ToString());

            return orders.Select(MapToOrderDTO).ToList();
        }

        // GET: api/Orders/stats
        [HttpGet("stats")]
        public async Task<ActionResult<DeliveryStatsDTO>> GetDeliveryStats()
        {
            var now = DateTime.UtcNow.Date;

            var deliveries = await _context.Deliveries.ToListAsync();

            var stats = new DeliveryStatsDTO
            {
                TotalDeliveries = deliveries.Count,
                PendingDeliveries = deliveries.Count(d => d.Status == "Pendente"),
                InProgressDeliveries = deliveries.Count(d => d.Status == "EmProgresso"),
                CompletedDeliveries = deliveries.Count(d => d.Status == "Concluida"),
                TodayDeliveries = deliveries.Count(d => d.EstimatedDeliveryTime.HasValue &&
                                                       d.EstimatedDeliveryTime.Value.Date == now),
                AverageDeliveryTime = deliveries
                    .Where(d => d.ActualDeliveryTime.HasValue && d.EstimatedDeliveryTime.HasValue)
                    .Select(d => (d.ActualDeliveryTime.Value - d.CreatedAt).TotalMinutes)
                    .DefaultIfEmpty(0)
                    .Average()
            };

            return stats;
        }

        // GET: api/Orders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDTO>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.Delivery)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();
            return MapToOrderDTO(order);
        }

        // POST: api/Orders/create
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
                IsDelivery = false,
                CreatedAt = DateTime.UtcNow,
                OrderNumber = orderNumber,
                
                OrderItems = new List<OrderItem>()
                
            };



            //var errors = new List<string>();
            //foreach (var item in dto.Items)
            //{
            //    var product = await _context.Products.FindAsync(item.ProductId);
            //    if (product == null)
            //    {
            //        errors.Add($"Produto com ID {item.ProductId} não encontrado.");
            //        continue;
            //    }

            //    if (item.Quantity <= 0)
            //    {
            //        errors.Add($"Quantidade do produto {product.Name} deve ser maior que zero.");
            //        continue;
            //    }

            //    order.OrderItems.Add(new OrderItem
            //    {
            //        ProductId = item.ProductId,
            //        Quantity = item.Quantity,
            //        UnitPrice = item.UnitPrice,
            //        TotalPrice = item.Quantity * item.UnitPrice
            //    });
            //}

            //if (errors.Any()) return BadRequest(new { Errors = errors });
            // 🔄 Processar itens via método separado
            (List<OrderItem> items, List<string> errors) = await ProcessOrderItems(dto.Items);

            if (errors.Any()) return BadRequest(new { Errors = errors });

            order.OrderItems = items;
            order.TotalAmount = items.Sum(i => i.TotalPrice);

            order.TotalAmount = order.OrderItems.Sum(oi => oi.TotalPrice);

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // 🔥 Recarregar com includes para DTO completo
            var savedOrder = await _context.Orders
       .Include(o => o.Customer)
       .Include(o => o.User)
       .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
       .Include(o => o.Delivery)
       .FirstOrDefaultAsync(o => o.Id == order.Id);

            return MapToOrderDTO(savedOrder!);

            //return MapToOrderDTO(order);
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim != null && int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("Não foi possível identificar o usuário logado");
        }

        private string GenerateOrderNumber()
        {
            try
            {
                var todayUtc = DateTime.UtcNow.Date; // Data UTC do dia atual

                var count = _context.Orders
                    .Where(o => o.CreatedAt >= todayUtc && o.CreatedAt < todayUtc.AddDays(1))
                    .Count();

                var date = DateTime.Now.ToString("yyyyMMdd");
                return $"PED-{date}-{(count + 1).ToString().PadLeft(4, '0')}";
            }
            catch (Exception ex)
            {
                // Fallback se houver erro na contagem
                var timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");
                return $"PED-EMG-{timestamp}";
            }
        }



        // POST: api/Orders/create-delivery
        [HttpPost("create-delivery")]
        public async Task<ActionResult<OrderDTO>> CreateOrderWithDelivery([FromBody] CreateOrderWithDeliveryDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (dto.Items == null || !dto.Items.Any())
                return BadRequest("O pedido deve conter ao menos um item.");
            if (dto.DeliveryInfo == null)
                return BadRequest("Informações de entrega são obrigatórias.");

            var orderNumber = GenerateOrderNumber();
            var userId = GetCurrentUserId();
            var order = new Order
            {
                CustomerId = dto.CustomerId,
                UserId = userId,
                PaymentMethod = dto.PaymentMethod,
                Status = "Aberto",
                IsDelivery = true,
                CreatedAt = DateTime.UtcNow,
                OrderNumber = orderNumber,
                OrderItems = new List<OrderItem>()
            };

            var errors = new List<string>();
            foreach (var item in dto.Items)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null) errors.Add($"Produto com ID {item.ProductId} não encontrado.");
                else if (item.Quantity <= 0) errors.Add($"Quantidade do produto {product.Name} deve ser maior que zero.");
                else
                {
                    order.OrderItems.Add(new OrderItem
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        TotalPrice = item.Quantity * item.UnitPrice
                    });
                }
            }

            if (errors.Any()) return BadRequest(new { Errors = errors });
            (List<OrderItem> items, List<string> errors2) = await ProcessOrderItems(dto.Items);


            order.TotalAmount = order.OrderItems.Sum(oi => oi.TotalPrice);

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                var delivery = new Delivery
                {
                    OrderId = order.Id,
                    DeliveryPerson = dto.DeliveryInfo.DeliveryPerson,
                    DeliveryAddress = dto.DeliveryInfo.DeliveryAddress,
                    CustomerPhone = dto.DeliveryInfo.CustomerPhone,
                    EstimatedDeliveryTime = dto.DeliveryInfo.EstimatedDeliveryTime,
                    Status = "Pendente",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Deliveries.Add(delivery);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                // 🔥 Recarregar com includes
                var savedOrder = await _context.Orders
                    .Include(o => o.Customer)
                    .Include(o => o.User)
                    .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                    .Include(o => o.Delivery)
                    .FirstOrDefaultAsync(o => o.Id == order.Id);

                return MapToOrderDTO(savedOrder!);
                //return MapToOrderDTO(order);
            }
            catch
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Erro ao criar pedido com entrega.");
            }
        }

        // PUT: api/Orders/5/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDTO dto)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();

            order.Status = dto.Status;
            order.ModifiedAt = DateTime.UtcNow;
            order.ModifiedByUserId = int.Parse(User.FindFirst("id")?.Value ?? "0");

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Orders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.Delivery)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (order.OrderItems.Any()) _context.OrderItems.RemoveRange(order.OrderItems);
                if (order.Delivery != null) _context.Deliveries.Remove(order.Delivery);

                _context.Orders.Remove(order);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return NoContent();
            }
            catch
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Erro ao deletar o pedido.");
            }
        }

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
                IsDelivery = o.IsDelivery,
                CreatedAt = o.CreatedAt,
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
                    CustomerAddress = o.Customer?.Address,
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
                } : null
            };
        }

        //validação de estoque e atualização
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



    }
}
