using Fynanceo.API.Data;
using Fynanceo.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Fynanceo.API.Services
{
    public class CategoryService
    {
        private readonly ApplicationDbContext _context;

        public CategoryService(ApplicationDbContext  context)
        {

            _context = context;
        }

        public async Task<List<Category>> ListaCategorias()
        {
            return await _context.Categories.Where(c => c.IsActive).ToListAsync();
        }
        public async Task<Category> BuscaCategoria(int id)
        {
            var category = await _context.Categories.FindAsync(id);

            
            return category;
        }
        public async Task<Category> InsereNova(Category category)
        {
            category.IsActive = true;
            category.CreatedAt = DateTime.UtcNow;

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return category;
        }
        public async Task EditaCategoria(int id, Category category)
        {



            var existecategorias = category;
            

            existecategorias.Name = category.Name;
            existecategorias.Description = category.Description;



            _context.Entry(existecategorias).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task RemoveCategoria(int? id , Category category)
        {
            category.IsActive = false;
            

            await _context.SaveChangesAsync();
        }

        

    }
}
