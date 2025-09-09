namespace Fynanceo.API.Models.DTOs
{
    public class DeliveryStatsDTO
    {
        public int TotalDeliveries { get; set; }
        public int PendingDeliveries { get; set; }
        public int InProgressDeliveries { get; set; }
        public int CompletedDeliveries { get; set; }
        public int TodayDeliveries { get; set; }
        public double AverageDeliveryTime { get; set; }
    }
}
