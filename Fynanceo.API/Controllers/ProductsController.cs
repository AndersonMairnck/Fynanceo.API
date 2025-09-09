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
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDTO>>> GetProducts(bool includeInactive = false)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .AsQueryable();

            // Filtrar apenas ativos por padrão
            if (!includeInactive)
            {
                query = query.Where(p => p.IsActive);
            }

            var products = await query
                .Select(p => new ProductDTO
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    CostPrice = p.CostPrice,
                    StockQuantity = p.StockQuantity,
                    MinStockLevel = p.MinStockLevel,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category.Name,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt,
                    ModifiedAt = p.ModifiedAt,
                    DeactivatedAt = p.DeactivatedAt,
                    DeactivatedReason = p.DeactivatedReason
                })
                .ToListAsync();

            return Ok(products);
        }

        // GET: api/Products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDTO>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.Id == id && p.IsActive)
                .Select(p => new ProductDTO
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    CostPrice = p.CostPrice,
                    StockQuantity = p.StockQuantity,
                    MinStockLevel = p.MinStockLevel,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category.Name,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (product == null)
            {
                return NotFound();
            }

            return product;
        }

        // POST: api/Products
        [HttpPost]
        public async Task<ActionResult<ProductDTO>> PostProduct(CreateProductDTO createProductDto)
        {
            var product = new Product
            {
                Name = createProductDto.Name,
                Description = createProductDto.Description,
                Price = createProductDto.Price,
                CostPrice = createProductDto.CostPrice,
                StockQuantity = createProductDto.StockQuantity,
                MinStockLevel = createProductDto.MinStockLevel,
                CategoryId = createProductDto.CategoryId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Recarregar com categoria para retornar o DTO completo
            await _context.Entry(product).Reference(p => p.Category).LoadAsync();

            var productDto = new ProductDTO
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                CostPrice = product.CostPrice,
                StockQuantity = product.StockQuantity,
                MinStockLevel = product.MinStockLevel,
                CategoryId = product.CategoryId,
                CategoryName = product.Category.Name,
                IsActive = product.IsActive,
                CreatedAt = product.CreatedAt
            };

            return CreatedAtAction("GetProduct", new { id = product.Id }, productDto);
        }

        // PUT: api/Products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, CreateProductDTO updateProductDto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            product.Name = updateProductDto.Name;
            product.Description = updateProductDto.Description;
            product.Price = updateProductDto.Price;
            product.CostPrice = updateProductDto.CostPrice;
            product.StockQuantity = updateProductDto.StockQuantity;
            product.MinStockLevel = updateProductDto.MinStockLevel;
            //product.CategoryId = updateProductDto.CategoryId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
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

        //// DELETE: api/Products/5
        //[HttpDelete("{id}")]
        //public async Task<IActionResult> DeleteProduct(int id)
        //{
        //    var product = await _context.Products.FindAsync(id);
        //    if (product == null)
        //    {
        //        return NotFound();
        //    }

        //    product.IsActive = false;
        //    await _context.SaveChangesAsync();

        //    return NoContent();
        //}
        // Controllers/ProductsController.cs
        [HttpPatch("deactivate/{id}")]
        public async Task<IActionResult> DeactivateProduct(int id, [FromBody] DeactivateRequest request)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            if (!product.IsActive)
            {
                return BadRequest("Produto já está desativado");
            }

            // Soft delete - mantém todos os dados, apenas desativa
            product.IsActive = false;
            product.DeactivatedAt = DateTime.UtcNow;
            product.DeactivatedReason = request?.Reason;
            product.DeactivatedByUserId = GetCurrentUserId(); // Método para obter ID do usuário logado
            product.ModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Produto desativado com sucesso",
                ProductId = product.Id,
                DeactivatedAt = product.DeactivatedAt
            });
        }

        [HttpPatch("activate/{id}")]
        public async Task<IActionResult> ActivateProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            if (product.IsActive)
            {
                return BadRequest("Produto já está ativo");
            }

            // Reativar o produto
            product.IsActive = true;
            product.DeactivatedAt = null;
            product.DeactivatedReason = null;
            product.DeactivatedByUserId = null;
            product.ModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Produto reativado com sucesso",
                ProductId = product.Id
            });
        }

        // Método auxiliar para obter ID do usuário logado
        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            return null;
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.Id == id && e.IsActive);
        }
    }
}