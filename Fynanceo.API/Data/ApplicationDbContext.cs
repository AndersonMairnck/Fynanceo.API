// Data/ApplicationDbContext.cs
using Fynanceo.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Fynanceo.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Tabelas do sistema
        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Delivery> Deliveries { get; set; }

        public DbSet<Payment> Payments { get; set; } // Novo DbSet

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            // Configurações específicas do PostgreSQL
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                // Configurar nomes de tabelas em snake_case (opcional)
                entity.SetTableName(entity.GetTableName().ToLower());

                // Configurar colunas em snake_case (opcional)
                foreach (var property in entity.GetProperties())
                {
                    property.SetColumnName(property.Name.ToLower());
                }
            }

            // Configurações das entidades
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.Role).HasDefaultValue("Funcionario");
                entity.Property(u => u.IsActive).HasDefaultValue(true);
                entity.Property(u => u.CreatedAt).HasDefaultValueSql("NOW()");
            });

            
            modelBuilder.Entity<Product>(entity =>
            {
                entity.Property(p => p.CreatedAt).HasDefaultValueSql("NOW()");
            });

            modelBuilder.Entity<Category>(entity =>
            {
                entity.Property(c => c.CreatedAt).HasDefaultValueSql("NOW()");
            });

            // No método OnModelCreating, na configuração da entidade Order
            modelBuilder.Entity<Order>(entity =>
            {
                entity.Property(o => o.TotalAmount).HasColumnType("decimal(18,2)");
                entity.Property(o => o.Status).HasDefaultValue("Aberto");
                entity.Property(o => o.CreatedAt).HasDefaultValueSql("NOW()");
                entity.Property(o => o.ModifiedAt).IsRequired(false); // Campo opcional
            });

            modelBuilder.Entity<Customer>(entity =>
            {
                entity.Property(c => c.CreatedAt).HasDefaultValueSql("NOW()");
            });

            modelBuilder.Entity<Delivery>(entity =>
            {
                entity.Property(d => d.CreatedAt).HasDefaultValueSql("NOW()");
            });
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasOne(p => p.Order)
                      .WithMany(o => o.Payments)
                      .HasForeignKey(p => p.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}