using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Fynanceo.API.Data;
using Fynanceo.API.Models.Entities;
using Fynanceo.API.Models.DTOs;
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

        // GET: api/Orders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetOrders(
            [FromQuery] string status = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var query = _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .AsQueryable();

            // Filtros
            if (!string.IsNullOrEmpty(status))
                query = query.Where(o => o.Status == status);

            if (startDate.HasValue)
                query = query.Where(o => o.CreatedAt >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(o => o.CreatedAt <= endDate.Value);

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderDTO
                {
                    Id = o.Id,
                    OrderNumber = o.OrderNumber,
                    CustomerId = o.CustomerId,
                    CustomerName = o.Customer != null ? o.Customer.Name : "Cliente não identificado",
                    UserId = o.UserId,
                    UserName = o.User.Name,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    PaymentMethod = o.PaymentMethod,
                    IsDelivery = o.IsDelivery,
                    CreatedAt = o.CreatedAt,
                    Items = o.OrderItems.Select(oi => new OrderItemDTO
                    {
                        Id = oi.Id,
                        ProductId = oi.ProductId,
                        ProductName = oi.Product.Name,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice
                    }).ToList()
                })
                .ToListAsync();

            return Ok(orders);
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
                .Where(o => o.Id == id)
                .Select(o => new OrderDTO
                {
                    Id = o.Id,
                    OrderNumber = o.OrderNumber,
                    CustomerId = o.CustomerId,
                    CustomerName = o.Customer != null ? o.Customer.Name : "Cliente não identificado",
                    UserId = o.UserId,
                    UserName = o.User.Name,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    PaymentMethod = o.PaymentMethod,
                    IsDelivery = o.IsDelivery,
                    CreatedAt = o.CreatedAt,
                    Items = o.OrderItems.Select(oi => new OrderItemDTO
                    {
                        Id = oi.Id,
                        ProductId = oi.ProductId,
                        ProductName = oi.Product.Name,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice
                    }).ToList(),
                    Delivery = o.Delivery != null ? new DeliveryDTO
                    {
                        Id = o.Delivery.Id,
                        DeliveryPerson = o.Delivery.DeliveryPerson,
                        Status = o.Delivery.Status,
                        DeliveryAddress = o.Delivery.DeliveryAddress,
                        CustomerPhone = o.Delivery.CustomerPhone,
                        EstimatedDeliveryTime = o.Delivery.EstimatedDeliveryTime,
                        ActualDeliveryTime = o.Delivery.ActualDeliveryTime
                    } : null
                })
                .FirstOrDefaultAsync();

            if (order == null)
            {
                return NotFound();
            }

            return order;
        }

        // POST: api/Orders
        [HttpPost]
        public async Task<ActionResult<OrderDTO>> CreateOrder(CreateOrderDTO orderDto)
        {
            // Gerar número do pedido
            var orderNumber = GenerateOrderNumber();

            // Obter usuário atual
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var order = new Order
            {
                OrderNumber = orderNumber,
                CustomerId = orderDto.CustomerId,
                UserId = userId,
                TotalAmount = orderDto.Items.Sum(item => item.Quantity * item.UnitPrice),
                Status = "Aberto",
                PaymentMethod = orderDto.PaymentMethod,
                IsDelivery = orderDto.IsDelivery,
                CreatedAt = DateTime.UtcNow,
                OrderItems = orderDto.Items.Select(item => new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TotalPrice = item.Quantity * item.UnitPrice
                }).ToList()
            };

            // Atualizar estoque
            foreach (var item in order.OrderItems)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product != null)
                {
                    if (product.StockQuantity < item.Quantity)
                    {
                        return BadRequest($"Estoque insuficiente para o produto: {product.Name}");
                    }
                    product.StockQuantity -= item.Quantity;
                }
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Se for entrega, criar registro de delivery
            if (orderDto.IsDelivery && orderDto.DeliveryInfo != null)
            {
                var delivery = new Delivery
                {
                    OrderId = order.Id,
                    DeliveryPerson = orderDto.DeliveryInfo.DeliveryPerson,
                    Status = "Pendente",
                    DeliveryAddress = orderDto.DeliveryInfo.DeliveryAddress,
                    CustomerPhone = orderDto.DeliveryInfo.CustomerPhone,
                    EstimatedDeliveryTime = orderDto.DeliveryInfo.EstimatedDeliveryTime,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Deliveries.Add(delivery);
                await _context.SaveChangesAsync();
            }

            // Retornar o pedido criado
            return CreatedAtAction("GetOrder", new { id = order.Id }, await GetOrder(order.Id));
        }

        // PATCH: api/Orders/5/status
        // No OrdersController, método UpdateOrderStatus
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDTO statusDto)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            order.Status = statusDto.Status;
            order.ModifiedAt = DateTime.UtcNow;
            order.ModifiedReason = $"Status alterado para: {statusDto.Status}";
            order.ModifiedByUserId = GetCurrentUserId();

            // Se o pedido for finalizado, atualizar estoque permanentemente
            if (statusDto.Status == "Finalizado" || statusDto.Status == "Cancelado")
            {
                var orderItems = await _context.OrderItems
                    .Where(oi => oi.OrderId == id)
                    .Include(oi => oi.Product)
                    .ToListAsync();

                foreach (var item in orderItems)
                {
                    var product = item.Product;
                    if (statusDto.Status == "Cancelado")
                    {
                        // Devolver ao estoque se cancelado
                        product.StockQuantity += item.Quantity;
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = $"Status do pedido atualizado para: {statusDto.Status}",
                ModifiedAt = order.ModifiedAt
            });
        }

        // DELETE: api/Orders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            if (order.Status == "Finalizado")
            {
                return BadRequest("Não é possível cancelar um pedido finalizado");
            }

            // Devolver produtos ao estoque
            foreach (var item in order.OrderItems)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product != null)
                {
                    product.StockQuantity += item.Quantity;
                }
            }

            order.Status = "Cancelado";
            order.ModifiedAt = DateTime.UtcNow;
            order.ModifiedReason = "Pedido cancelado pelo usuário";
            order.ModifiedByUserId = GetCurrentUserId();

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Pedido cancelado com sucesso",
                CancelledAt = order.ModifiedAt
            });
        }

        private string GenerateOrderNumber()
        {
            var date = DateTime.Now.ToString("yyyyMMdd");
            var count = _context.Orders.Count(o => o.CreatedAt.Date == DateTime.Today) + 1;
            return $"PED-{date}-{count.ToString().PadLeft(4, '0')}";
        }
        // No OrdersController, adicione este método privado:
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }

            // Se não conseguir obter o ID do usuário, lance uma exceção ou retorne um valor padrão
            throw new UnauthorizedAccessException("Não foi possível identificar o usuário logado");
        }
    }
}