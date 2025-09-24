using Fynanceo.API.Data;
using Fynanceo.API.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fynanceo.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
  //  [Authorize]
    public class CustomersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CustomersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Customers
        //Este método retorna uma lista de todos os clientes ativos no banco de dados
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
        {
            //return await _context.Customers.ToListAsync();
            return await _context.Customers
        .Where(c => c.IsActive)
        .ToListAsync();
        }

        // GET: api/Customers/5
        [HttpGet("{id}")]
        //Este método busca e retorna um único cliente pelo seu id
        public async Task<ActionResult<Customer>> GetCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);

            if (customer == null)
            {
                return NotFound();
            }

            return customer;
        }

        // POST: api/Customers
        // Este método cria um novo cliente. Antes de adicioná-lo ao banco de dados, ele realiza uma validação: verifica se já existe um cliente ativo com o mesmo endereço de e-mail
        [HttpPost]
        public async Task<ActionResult<Customer>> PostCustomer(Customer customer)
        {
           

            if (await _context.Customers.AnyAsync(c => c.Email == customer.Email && c.IsActive))
            {
                return BadRequest("Já existe um cliente com este e-mail.");
            }

            customer.CreatedAt = DateTime.UtcNow;
            customer.IsActive = true;

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCustomer", new { id = customer.Id }, customer);
        }

        // PUT: api/Customers/5
        //Este método atualiza as informações de um cliente existente.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCustomer(int id, Customer customer)
        {
            

            var existingCustomer = await _context.Customers.FindAsync(id);
            if (existingCustomer == null || !existingCustomer.IsActive)
            {
                return NotFound();
            }

            existingCustomer.Name = customer.Name;
            existingCustomer.Email = customer.Email;
            existingCustomer.Phone = customer.Phone;
            existingCustomer.UpdatedAt = DateTime.UtcNow;
            existingCustomer.Bairro = customer.Bairro;
            existingCustomer.Estado = customer.Estado;
            existingCustomer.Cep = customer.Cep;
            existingCustomer.Cidade = customer.Cidade;
            existingCustomer.Complemento = customer.Complemento;
            existingCustomer.Rua = customer.Rua;
            existingCustomer.TipoPessoa = customer.TipoPessoa;
            existingCustomer.CpfCnpj = customer.CpfCnpj;

            _context.Entry(existingCustomer).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCustomer", new { id = customer.Id }, customer);
        }

        // DELETE: api/Customers/5
        //Este método não exclui o cliente do banco de dados, mas sim o desativa(conhecido como "soft delete"). Ele busca o cliente pelo id
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound();
            }

            customer.IsActive = false;
            _context.Entry(customer).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }


        private bool CustomerExists(int id)
        {
            return _context.Customers.Any(e => e.Id == id);
        }
    }
}