// Data/ApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;
using Fynanceo.API.Models.Entities;

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

            //modelBuilder.Entity<Product>(entity =>
            //{
            //    entity.Property(p => p.Price).HasColumnType("decimal(18,2)");
            //    entity.Property(p => p.CostPrice).HasColumnType("decimal(18,2)");
            //    entity.Property(p => p.IsActive).HasDefaultValue(true);
            //    entity.Property(p => p.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

            //    entity.HasOne(p => p.Category)
            //        .WithMany(c => c.Products)
            //        .HasForeignKey(p => p.CategoryId)
            //        .OnDelete(DeleteBehavior.Restrict);
            //});

            //modelBuilder.Entity<Category>(entity =>
            //{
            //    entity.Property(c => c.IsActive).HasDefaultValue(true);
            //    entity.Property(c => c.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            //});

            //modelBuilder.Entity<Order>(entity =>
            //{
            //    entity.Property(o => o.TotalAmount).HasColumnType("decimal(18,2)");
            //    entity.Property(o => o.Status).HasDefaultValue("Aberto");
            //    entity.Property(o => o.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

            //    entity.HasOne(o => o.Customer)
            //        .WithMany(c => c.Orders)
            //        .HasForeignKey(o => o.CustomerId)
            //        .OnDelete(DeleteBehavior.Restrict);

            //    entity.HasOne(o => o.User)
            //        .WithMany()
            //        .HasForeignKey(o => o.UserId)
            //        .OnDelete(DeleteBehavior.Restrict);
            //});

            //modelBuilder.Entity<OrderItem>(entity =>
            //{
            //    entity.Property(oi => oi.UnitPrice).HasColumnType("decimal(18,2)");
            //    entity.Property(oi => oi.TotalPrice).HasColumnType("decimal(18,2)");

            //    entity.HasOne(oi => oi.Order)
            //        .WithMany(o => o.OrderItems)
            //        .HasForeignKey(oi => oi.OrderId)
            //        .OnDelete(DeleteBehavior.Cascade);

            //    entity.HasOne(oi => oi.Product)
            //        .WithMany(p => p.OrderItems)
            //        .HasForeignKey(oi => oi.ProductId)
            //        .OnDelete(DeleteBehavior.Restrict);
            //});

            //modelBuilder.Entity<Customer>(entity =>
            //{
            //    entity.Property(c => c.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            //});

            //modelBuilder.Entity<Delivery>(entity =>
            //{
            //    entity.Property(d => d.Status).HasDefaultValue("Pendente");
            //    entity.Property(d => d.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

            //    entity.HasOne(d => d.Order)
            //        .WithOne(o => o.Delivery)
            //        .HasForeignKey<Delivery>(d => d.OrderId)
            //        .OnDelete(DeleteBehavior.Cascade);
            //});
            // Alterar todas as configurações de data para PostgreSQL
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
        }
    }
}