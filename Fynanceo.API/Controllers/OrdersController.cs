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

        // POST: api/Orders (Para pedidos sem entrega)
        [HttpPost]
        public async Task<ActionResult<OrderDTO>> CreateOrder(CreateOrderDTO orderDto)
        {
            return await CreateOrderInternal(orderDto, false, null);
        }

        // POST: api/Orders/with-delivery (Para pedidos com entrega)
        [HttpPost("with-delivery")]
        public async Task<ActionResult<OrderDTO>> CreateOrderWithDelivery(CreateOrderWithDeliveryDTO orderDto)
        {
            return await CreateOrderInternal(orderDto, true, orderDto.DeliveryInfo);
        }

        private async Task<ActionResult<OrderDTO>> CreateOrderInternal(CreateOrderDTO orderDto, bool isDelivery, DeliveryInfoDTO deliveryInfoParam)
        {
            try
            {
                // Validações iniciais
                if (orderDto.Items == null || orderDto.Items.Count == 0)
                {
                    return BadRequest(new { message = "O pedido deve conter pelo menos um item" });
                }

                if (isDelivery && deliveryInfoParam == null)
                {
                    return BadRequest(new { message = "Informações de entrega são obrigatórias para pedidos com delivery" });
                }

                if (isDelivery && string.IsNullOrEmpty(deliveryInfoParam.DeliveryAddress))
                {
                    return BadRequest(new { message = "Endereço de entrega é obrigatório" });
                }

                // Gerar número do pedido
                var orderNumber = GenerateOrderNumber();

                // Obter usuário atual
                var userId = GetCurrentUserId();

                var order = new Order
                {
                    OrderNumber = orderNumber,
                    CustomerId = orderDto.CustomerId,
                    UserId = userId,
                    TotalAmount = orderDto.Items.Sum(item => item.Quantity * item.UnitPrice),
                    Status = "Aberto",
                    PaymentMethod = orderDto.PaymentMethod,
                    IsDelivery = isDelivery,
                    CreatedAt = DateTime.UtcNow,
                    OrderItems = orderDto.Items.Select(item => new OrderItem
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        TotalPrice = item.Quantity * item.UnitPrice
                    }).ToList()
                };

                // Validar e atualizar estoque
                foreach (var item in orderDto.Items)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null)
                    {
                        throw new Exception($"Produto com ID {item.ProductId} não encontrado");
                    }

                    if (product.StockQuantity < item.Quantity)
                    {
                        throw new Exception($"Estoque insuficiente para o produto: {product.Name}. Disponível: {product.StockQuantity}, Solicitado: {item.Quantity}");
                    }

                    product.StockQuantity -= item.Quantity;
                }

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // Se for entrega, criar registro de delivery
                if (isDelivery && deliveryInfoParam != null)
                {
                    var delivery = new Delivery
                    {
                        OrderId = order.Id,
                        DeliveryPerson = deliveryInfoParam.DeliveryPerson,
                        Status = "Pendente",
                        DeliveryAddress = deliveryInfoParam.DeliveryAddress,
                        CustomerPhone = deliveryInfoParam.CustomerPhone,
                        EstimatedDeliveryTime = deliveryInfoParam.EstimatedDeliveryTime,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Deliveries.Add(delivery);
                    await _context.SaveChangesAsync();
                }
           

              // return CreatedAtAction("GetOrder", new { id = order.Id }, await GetOrderDTO(order.Id));
                return Ok(await GetOrderDTO(order.Id));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private async Task ValidateAndUpdateStock(List<CreateOrderItemDTO> items)
        {
            foreach (var item in items)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null)
                {
                    throw new Exception($"Produto com ID {item.ProductId} não encontrado");
                }

                if (product.StockQuantity < item.Quantity)
                {
                    throw new Exception($"Estoque insuficiente para o produto: {product.Name}. Disponível: {product.StockQuantity}, Solicitado: {item.Quantity}");
                }

                product.StockQuantity -= item.Quantity;
            }
        }

        private async Task CreateDeliveryRecord(int orderId, DeliveryInfoDTO deliveryInfoDto)
        {
            var delivery = new Delivery
            {
                OrderId = orderId,
                DeliveryPerson = deliveryInfoDto.DeliveryPerson, // Agora sem ambiguidade
                DeliveryAddress = deliveryInfoDto.DeliveryAddress,
                CustomerPhone = deliveryInfoDto.CustomerPhone,
                EstimatedDeliveryTime = deliveryInfoDto.EstimatedDeliveryTime,
                CreatedAt = DateTime.UtcNow
            };


            _context.Deliveries.Add(delivery);
            await _context.SaveChangesAsync();
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

            // ... (filtros existentes)

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
                .ToListAsync();

            return Ok(orders);
        }

        // ... (outros métodos existentes)

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

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim != null && int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("Não foi possível identificar o usuário logado");
        }

        private async Task<OrderDTO> GetOrderDTO(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.Delivery)
                .Where(o => o.Id == orderId)
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

            return order;
        }
    }
}