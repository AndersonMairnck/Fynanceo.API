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
    //[Authorize]
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

            if (!includeInactive)
                query = query.Where(p => p.IsActive);

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
                    CreatedAt = p.CreatedAt,
                    ModifiedAt = p.ModifiedAt
                })
                .FirstOrDefaultAsync();

            if (product == null)
                return NotFound();

            return product;
        }

        // POST: api/Products
        [HttpPost]
        public async Task<ActionResult<ProductDTO>> PostProduct(CreateProductDTO createProductDto)
        {
            if (createProductDto.Price < 0 || createProductDto.CostPrice < 0 ||
                createProductDto.StockQuantity < 0 || createProductDto.MinStockLevel < 0)
            {
                return BadRequest("Valores de preço, custo ou estoque não podem ser negativos.");
            }

            if (_context.Products.Any(p => p.Name == createProductDto.Name && p.IsActive))
            {
                return BadRequest("Já existe um produto ativo com este nome.");
            }

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
            if (product == null || !product.IsActive)
                return NotFound();

            if (updateProductDto.Price < 0 || updateProductDto.CostPrice < 0 ||
                updateProductDto.StockQuantity < 0 || updateProductDto.MinStockLevel < 0)
            {
                return BadRequest("Valores de preço, custo ou estoque não podem ser negativos.");
            }

            if (_context.Products.Any(p => p.Id != id && p.Name == updateProductDto.Name && p.IsActive))
            {
                return BadRequest("Já existe um produto ativo com este nome.");
            }

            product.Name = updateProductDto.Name;
            product.Description = updateProductDto.Description;
            product.Price = updateProductDto.Price;
            product.CostPrice = updateProductDto.CostPrice;
            product.StockQuantity = updateProductDto.StockQuantity;
            product.MinStockLevel = updateProductDto.MinStockLevel;
            product.CategoryId = updateProductDto.CategoryId;
            product.ModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(product);
        }

        // PATCH: api/Products/deactivate/5
        [HttpPatch("deactivate/{id}")]
        public async Task<IActionResult> DeactivateProduct(int id, [FromBody] DeactivateRequest request)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            if (!product.IsActive)
                return BadRequest("Produto já está desativado.");

            product.IsActive = false;
            product.DeactivatedAt = DateTime.UtcNow;
            product.DeactivatedReason = request?.Reason;
            product.DeactivatedByUserId = GetCurrentUserId();
            product.ModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(product);
        }

        // PATCH: api/Products/activate/5
        [HttpPatch("activate/{id}")]
        public async Task<IActionResult> ActivateProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            if (product.IsActive)
                return BadRequest("Produto já está ativo.");

            product.IsActive = true;
            product.DeactivatedAt = null;
            product.DeactivatedReason = null;
            product.DeactivatedByUserId = null;
            product.ModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(product);
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                throw new UnauthorizedAccessException("Não foi possível identificar o usuário logado.");

            return userId;
        }
    }
}
