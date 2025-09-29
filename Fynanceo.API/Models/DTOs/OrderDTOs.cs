namespace Fynanceo.API.Models.DTOs
{
 

  

   

 

    // DTOs para retorno de dados
    public class OrderDTO
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; }
        public int? CustomerId { get; set; }
        public string CustomerName { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; }
        public string PaymentMethod { get; set; }
        public bool IsDelivery { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<OrderItemDTO> Items { get; set; }
        public DeliveryDTO Delivery { get; set; }
        public string DeliveryType { get;  set; }


  
        public string PaymentStatus { get; set; } // Novo

        public int? TableNumber { get; set; } // Novo
        public string OrderType { get; set; } // Novo
        public string? Notes { get; set; } // Novo

        public DateTime? ModifiedAt { get; set; }

    
        public List<PaymentDTO> Payments { get; set; } = new List<PaymentDTO>(); // Novo

    }



   


}