using Fynanceo.API.Data;
using Fynanceo.API.Models.Entities;
using Fynanceo.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace Fynanceo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
   // [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly CategoryService _cagegoryService;

        public CategoriesController(ApplicationDbContext context, CategoryService categoryService)
        {
            _context = context;
            _cagegoryService = categoryService;
        }

        // GET: api/Categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
           var list = (await _cagegoryService.ListaCategorias());
            return list;
            //return await _context.Categories.Where(c => c.IsActive).ToListAsync();
        }

        // GET: api/Categories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var cat = new Category();
            if (id > 0)
            {
                var category = await _cagegoryService.BuscaCategoria(id);
                //var category = await _context.Categories.FindAsync(id);

                if (category == null || !category.IsActive)
                {
                    return NotFound();
                }
                return category;
            }
            cat.Id = 00000;
            cat.Name = "Id foi enviado inválido";
            return cat;
        }


        // POST: api/Categories
        [HttpPost]
        public async Task<ActionResult<Category>> PostCategory(Category category)
        {
            var categoria = _cagegoryService.InsereNova(category);
                   

            return CreatedAtAction("GetCategory", new { id = category.Id }, category);
        }

        // PUT: api/Categories/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategory(int id, Category category)
        {

           //verifica se tem categoria
            var existecategorias = await _cagegoryService.BuscaCategoria(id);
            if (existecategorias == null || !existecategorias.IsActive)
            {
                return NotFound();
            }

            existecategorias.Name = category.Name;
            existecategorias.Description = category.Description;


            _cagegoryService.EditaCategoria(id, existecategorias);

            return CreatedAtAction("GetCategory", new { id = existecategorias.Id }, existecategorias);

           
        }

        // DELETE: api/Categories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {

            //verifica se tem categoria
            var existecategorias = await _cagegoryService.BuscaCategoria(id);
            if (existecategorias == null )
            {
                return NotFound();
            }

            _cagegoryService.RemoveCategoria(id, existecategorias);
   
           

            return NoContent();
        }

       
    }
}