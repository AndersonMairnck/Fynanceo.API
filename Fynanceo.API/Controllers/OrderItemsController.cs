using Fynanceo.API.Data;
using Fynanceo.API.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fynanceo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderItemsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrderItemsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/OrderItems/order/5
        [HttpGet("order/{orderId}")]
        public async Task<ActionResult<IEnumerable<OrderItem>>> GetOrderItemsByOrder(int orderId)
        {
            var orderItems = await _context.OrderItems
                .Include(oi => oi.Product)
                .Where(oi => oi.OrderId == orderId)
                .Select(oi => new
                {
                    oi.Id,
                    oi.OrderId,
                    oi.ProductId,
                    ProductName = oi.Product.Name,
                    oi.Quantity,
                    oi.UnitPrice,
                    oi.TotalPrice
                })
                .ToListAsync();

            return Ok(orderItems);
        }

        // POST: api/OrderItems
        [HttpPost]
        public async Task<ActionResult<OrderItem>> AddItemToOrder(OrderItem item)
        {
            // Verificar estoque
            var product = await _context.Products.FindAsync(item.ProductId);
            if (product == null)
            {
                return NotFound("Produto não encontrado");
            }

            if (product.StockQuantity < item.Quantity)
            {
                return BadRequest("Estoque insuficiente");
            }

            // Calcular total
            item.TotalPrice = item.Quantity * item.UnitPrice;

            _context.OrderItems.Add(item);

            // Atualizar estoque
            product.StockQuantity -= item.Quantity;

            await _context.SaveChangesAsync();

            return CreatedAtAction("GetOrderItemsByOrder", new { orderId = item.OrderId }, item);
        }

        // PUT: api/OrderItems/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrderItem(int id, OrderItem item)
        {
            if (id != item.Id)
            {
                return BadRequest();
            }

            var existingItem = await _context.OrderItems
                .Include(oi => oi.Product)
                .FirstOrDefaultAsync(oi => oi.Id == id);

            if (existingItem == null)
            {
                return NotFound();
            }

            // Calcular diferença de quantidade
            var quantityDifference = item.Quantity - existingItem.Quantity;

            // Verificar se há estoque suficiente para a diferença
            if (quantityDifference > 0 && existingItem.Product.StockQuantity < quantityDifference)
            {
                return BadRequest("Estoque insuficiente para a quantidade adicional");
            }

            // Atualizar estoque
            existingItem.Product.StockQuantity -= quantityDifference;

            // Atualizar item
            existingItem.Quantity = item.Quantity;
            existingItem.UnitPrice = item.UnitPrice;
            existingItem.TotalPrice = item.Quantity * item.UnitPrice;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderItemExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/OrderItems/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveOrderItem(int id)
        {
            var orderItem = await _context.OrderItems
                .Include(oi => oi.Product)
                .FirstOrDefaultAsync(oi => oi.Id == id);

            if (orderItem == null)
            {
                return NotFound();
            }

            // Devolver ao estoque
            orderItem.Product.StockQuantity += orderItem.Quantity;

            _context.OrderItems.Remove(orderItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool OrderItemExists(int id)
        {
            return _context.OrderItems.Any(e => e.Id == id);
        }
    }
}