// Status expandidos para controle de mesas
public static class OrderStatus
{
    public const string Aberto = "Aberto";          // Pedido criado, aguardando produtos
    public const string EmAndamento = "EmAndamento"; // Com produtos, aguardando mais itens ou pagamento
    public const string AguardandoPagamento = "AguardandoPagamento"; // Pronto para pagar
    public const string Pago = "Pago";              // Pagamento realizado
    public const string Finalizado = "Finalizado";  // Processo completo
    public const string Cancelado = "Cancelado";
}