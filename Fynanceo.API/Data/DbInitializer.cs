// Data/DbInitializer.cs
using Fynanceo.API.Models.Entities;
using System.Security.Cryptography;
using System.Text;

namespace Fynanceo.API.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureCreated();

            // Verificar se já existem usuários
            if (context.Users.Any())
            {
                return; // DB já foi inicializado
            }

            // Criar categorias
            if (!context.Categories.Any())
            {
                var categories = new Category[]
                {
                    new Category { Name = "Padaria", Description = "Produtos de padaria" },
                    new Category { Name = "Bebidas", Description = "Bebidas diversas" },
                    new Category { Name = "Lanches", Description = "Lanches e salgados" },
                    new Category { Name = "Pizzas", Description = "Pizzas diversas" },
                    new Category { Name = "Doces", Description = "Sobremesas e doces" }
                };

                context.Categories.AddRange(categories);
                context.SaveChanges();

                // Criar produtos de exemplo
                var products = new Product[]
                {
                    new Product {
                        Name = "Pão Francês",
                        Description = "Pão francês fresco",
                        Price = 0.50m,
                        CostPrice = 0.25m,
                        StockQuantity = 100,
                        MinStockLevel = 20,
                        CategoryId = categories[0].Id
                    },
                    new Product {
                        Name = "Café Expresso",
                        Description = "Café expresso tradicional",
                        Price = 3.50m,
                        CostPrice = 1.00m,
                        StockQuantity = 50,
                        MinStockLevel = 10,
                        CategoryId = categories[1].Id
                    },
                    new Product {
                        Name = "Sanduíche Natural",
                        Description = "Sanduíche natural com frango",
                        Price = 8.00m,
                        CostPrice = 3.50m,
                        StockQuantity = 30,
                        MinStockLevel = 5,
                        CategoryId = categories[2].Id
                    }
                };

                context.Products.AddRange(products);
                context.SaveChanges();
            }

            // Criar usuários
            CreateUser(context,
                name: "Administrador",
                email: "admin@fynanceo.com",
                password: "admin123",
                role: "Administrador"
            );

            CreateUser(context,
                name: "Funcionário",
                email: "funcionario@fynanceo.com",
                password: "func123",
                role: "Funcionario"
            );

            // Criar cliente de exemplo
            if (!context.Customers.Any())
            {
                var customer = new Customer
                {
                    Name = "Cliente Exemplo",
                    Phone = "(11) 99999-9999",
                    Email = "cliente@exemplo.com",
                    Rua = "Rua Exemplo, 123 - Centro",
                    CreatedAt = DateTime.UtcNow
                };

                context.Customers.Add(customer);
                context.SaveChanges();
            }
        }

        private static void CreateUser(ApplicationDbContext context, string name, string email, string password, string role)
        {
            if (context.Users.Any(u => u.Email == email)) return;

            using var hmac = new HMACSHA512();
            var passwordSalt = hmac.Key;
            var passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

            var user = new User
            {
                Name = name,
                Email = email,
                PasswordHash = Convert.ToBase64String(passwordHash),
                PasswordSalt = Convert.ToBase64String(passwordSalt),
                Role = role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(user);
            context.SaveChanges();
        }
    }
}
