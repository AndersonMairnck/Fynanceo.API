using FluentValidation;
using Fynanceo.API.Models.DTOs;

namespace Fynanceo.API.Validators
{
    public class CreateOrderDTOValidator : AbstractValidator<CreateOrderDTO>
    {
        public CreateOrderDTOValidator()
        {
            //    RuleFor(x => x.PaymentMethod).NotEmpty().WithMessage("Método de pagamento é obrigatório");
            //    RuleFor(x => x.Items).NotEmpty().WithMessage("O pedido deve conter itens");
            //    RuleForEach(x => x.Items).SetValidator(new CreateOrderItemDTOValidator());

            // COMENTE estas linhas temporariamente - elas são para a classe base
            // RuleFor(x => x.IsDelivery).NotEmpty().WithMessage("Informe se é delivery");
            // When(x => x.IsDelivery, () => {
            //     RuleFor(x => x.DeliveryInfo).NotNull().WithMessage("Informações de delivery são obrigatórias");
            //     RuleFor(x => x.DeliveryInfo.DeliveryAddress).NotEmpty().WithMessage("Endereço de entrega é obrigatório");
            // });



            //RuleFor(x => x)
            //    .Must(HaveValidDeliveryInfo)
            //    .WithMessage("DeliveryInfo é obrigatório para entregas e não permitido para retiradas");
        }

        private bool BeValidPaymentMethod(string paymentMethod)
        {
            var validMethods = new[] { "dinheiro", "cartao", "pix" };
            return validMethods.Contains(paymentMethod);
        }

        //private bool HaveValidDeliveryInfo(CreateOrderDTO order)
        //{
        //    //    if (order.IsDelivery && order.DeliveryInfo == null)
        //    //        return false;

        //    //    if (!order.IsDelivery && order.DeliveryInfo != null)
        //    //        return false;

        //    //    return true;
        //}

        public class CreateOrderWithDeliveryDTOValidator : AbstractValidator<CreateOrderWithDeliveryDTO>
        {
            //public CreateOrderWithDeliveryDTOValidator()
            //{
            //    Include(new CreateOrderDTOValidator()); // Inclui as regras base

            //    RuleFor(x => x.DeliveryInfo).NotNull().WithMessage("Informações de delivery são obrigatórias");
            //    RuleFor(x => x.DeliveryInfo.DeliveryAddress).NotEmpty().WithMessage("Endereço de entrega é obrigatório");
            //    RuleFor(x => x.DeliveryInfo.DeliveryPerson).NotEmpty().WithMessage("Entregador é obrigatório");
            //}
        }

        public class CreateOrderItemDTOValidator : AbstractValidator<CreateOrderItemDTO>
        {
            //public CreateOrderItemDTOValidator()
            //{
            //    RuleFor(x => x.ProductId).GreaterThan(0).WithMessage("ID do produto inválido");
            //    RuleFor(x => x.Quantity).GreaterThan(0).WithMessage("Quantidade deve ser maior que zero");
            //    RuleFor(x => x.UnitPrice).GreaterThan(0).WithMessage("Preço deve ser maior que zero");
            //}
        }
    }
}