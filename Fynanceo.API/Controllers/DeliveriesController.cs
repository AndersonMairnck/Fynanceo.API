using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Fynanceo.API.Data;
using Fynanceo.API.Models.Entities;
using Fynanceo.API.Models.DTOs;

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
            [FromQuery] DateTime? date = null)
        {
            var query = _context.Deliveries
                .Include(d => d.Order)
                    .ThenInclude(o => o.Customer)
                .Include(d => d.Order)
                    .ThenInclude(o => o.User)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(d => d.Status == status);

            if (date.HasValue)
                query = query.Where(d => d.CreatedAt.Date == date.Value.Date);

            var deliveries = await query
                .OrderByDescending(d => d.CreatedAt)
                .Select(d => new DeliveryDTO
                {
                    Id = d.Id,
                    OrderId = d.OrderId,
                    OrderNumber = d.Order.OrderNumber,
                    CustomerName = d.Order.Customer != null ? d.Order.Customer.Name : "Cliente não identificado",
                    CustomerAddress = d.Order.Customer != null ? d.Order.Customer.Address : d.DeliveryAddress,
                    CustomerPhone = d.Order.Customer != null ? d.Order.Customer.Phone : d.CustomerPhone,
                    DeliveryPerson = d.DeliveryPerson,
                    Status = d.Status,
                    DeliveryAddress = d.DeliveryAddress,
                    EstimatedDeliveryTime = d.EstimatedDeliveryTime,
                    ActualDeliveryTime = d.ActualDeliveryTime,
                    CreatedAt = d.CreatedAt,
                    OrderAmount = d.Order.TotalAmount
                })
                .ToListAsync();

            return Ok(deliveries);
        }

        // GET: api/Deliveries/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DeliveryDTO>> GetDelivery(int id)
        {
            var delivery = await _context.Deliveries
                .Include(d => d.Order)
                    .ThenInclude(o => o.Customer)
                .Include(d => d.Order)
                    .ThenInclude(o => o.User)
                .Include(d => d.Order)
                    .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Where(d => d.Id == id)
                .Select(d => new DeliveryDTO
                {
                    Id = d.Id,
                    OrderId = d.OrderId,
                    OrderNumber = d.Order.OrderNumber,
                    CustomerName = d.Order.Customer != null ? d.Order.Customer.Name : "Cliente não identificado",
                    CustomerAddress = d.Order.Customer != null ? d.Order.Customer.Address : d.DeliveryAddress,
                    CustomerPhone = d.Order.Customer != null ? d.Order.Customer.Phone : d.CustomerPhone,
                    DeliveryPerson = d.DeliveryPerson,
                    Status = d.Status,
                    DeliveryAddress = d.DeliveryAddress,
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
                .FirstOrDefaultAsync();

            if (delivery == null)
            {
                return NotFound();
            }

            return delivery;
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

            // Se a entrega foi concluída, registrar horário
            if (statusDto.Status == "Entregue")
            {
                delivery.ActualDeliveryTime = DateTime.UtcNow;
                delivery.Order.Status = "Entregue";
            }
            // Se saiu para entrega, atualizar status do pedido
            else if (statusDto.Status == "EmRota")
            {
                delivery.Order.Status = "SaiuParaEntrega";
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = $"Status da entrega atualizado para: {statusDto.Status}" });
        }

        // PUT: api/Deliveries/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDelivery(int id, UpdateDeliveryDTO deliveryDto)
        {
            var delivery = await _context.Deliveries.FindAsync(id);
            if (delivery == null)
            {
                return NotFound();
            }

            delivery.DeliveryPerson = deliveryDto.DeliveryPerson;
            delivery.DeliveryAddress = deliveryDto.DeliveryAddress;
            delivery.CustomerPhone = deliveryDto.CustomerPhone;
            delivery.EstimatedDeliveryTime = deliveryDto.EstimatedDeliveryTime;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Deliveries/stats
        [HttpGet("stats")]
        public async Task<ActionResult<DeliveryStatsDTO>> GetDeliveryStats()
        {
            var today = DateTime.Today;
            var deliveries = await _context.Deliveries.ToListAsync();

            var stats = new DeliveryStatsDTO
            {
                TotalDeliveries = deliveries.Count,
                PendingDeliveries = deliveries.Count(d => d.Status == "Pendente"),
                InProgressDeliveries = deliveries.Count(d => d.Status == "EmRota"),
                CompletedDeliveries = deliveries.Count(d => d.Status == "Entregue"),
                TodayDeliveries = deliveries.Count(d => d.CreatedAt.Date == today),
                AverageDeliveryTime = deliveries
                    .Where(d => d.ActualDeliveryTime.HasValue && d.CreatedAt != null)
                    .Average(d => (d.ActualDeliveryTime.Value - d.CreatedAt).TotalMinutes)
            };

            return Ok(stats);
        }
    }
}