namespace Fynanceo.API.Models.DTOs
{
    public class UpdateDeliveryDTO
    {
        public string DeliveryPerson { get; set; }
        public string DeliveryAddress { get; set; }
        public string CustomerPhone { get; set; }
        public DateTime? EstimatedDeliveryTime { get; set; }
    }
}
