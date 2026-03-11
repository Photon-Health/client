const es = {
  // Core UI
  askForBestPrice: 'Pida a su farmacéutico que le ayude a encontrar el mejor precio posible.',
  bin: 'BIN',
  callPharmacy: 'Llamar a la farmacia',
  closed: 'Cerrada',
  closingSoon: 'Cerrando pronto',
  contactSupport: 'Contactar soporte',
  couponHelpsPayLess:
    'El precio del cupón le ayuda a pagar menos que el precio minorista de su receta. Está disponible en farmacias seleccionadas a través de nuestros socios y es gratuito. Solo muéstrelo al farmacéutico cuando recoja su receta.',
  couponWithInsurance: '¿Puedo usar este cupón si tengo seguro médico?',
  couponVsInsurance:
    'El precio del cupón puede ser menor que el copago de su seguro médico. Se puede usar en lugar de su copago y no se aplica a su deducible.',
  changePharmacy: 'Cambiar farmacia',
  daysSupply: 'Días de suministro',
  delivered: 'Entregado',
  delivery: 'Entrega a domicilio',
  directions: 'Obtener indicaciones',
  dismiss: 'Descartar',
  enterLoc: 'Ingrese un código postal o dirección',
  enterLocLong: 'Ingrese el código postal o la dirección donde desea buscar una farmacia.',
  errorMarkPickedUp: 'No se puede marcar el pedido como recogido',
  errorMarkDelivered: 'No se puede marcar el pedido como entregado',
  expires: 'Vence',
  demoTitle: 'Demo de experiencia del paciente',
  fakeRx: 'Esta no es una receta real.',
  fakeRxs: 'Estas no son recetas reales.',
  findLoc: 'Encontrar una ubicación',
  genericPriceDisclaimer: 'Este precio es solo para medicamentos genéricos',
  getDelivered: 'Reciba su medicamento en la puerta de su casa',
  getNearby: 'Obtenga su medicamento en una farmacia cercana',
  gettingLoc: 'Obteniendo ubicación actual',
  group: 'Grupo',
  help: 'Ayuda',
  howDoIUseCouponCard: '¿Cómo uso una tarjeta de cupón?',
  howToCoupon: 'Cómo usar este cupón',
  howToUseCouponCard:
    'Active los cupones para ver los precios con cupón. Los detalles estarán disponibles después de seleccionar una farmacia con precio de cupón. Solo muestre la tarjeta de cupón al farmacéutico cuando recoja su receta.',
  inTransit: 'En tránsito',
  makePreferred: 'Hacer esta mi farmacia preferida',
  memberId: 'ID de miembro',
  next: 'Siguiente',
  noMatch: 'No encontramos lo que busca.',
  noMedicare: 'No se puede usar junto con Medicare o Medicaid.',
  open: 'Abierta',
  open24hrs: 'Abierta 24 horas',
  orderCanceled: 'Este pedido fue cancelado.',
  orderDelivered: 'Su pedido fue entregado',
  orderInTransit: 'Su pedido está en tránsito',
  orderPickedUp: 'Su pedido fue recogido',
  orderPlaced: 'Enviado',
  orderReady: 'Su pedido está listo',
  orderWasPlaced: 'Su pedido ha sido enviado',
  patient: 'Paciente',
  pcn: 'PCN',
  pickedUp: 'Recogido',
  pickUp: 'Recoger',
  pickUpLabel: 'Recoger:',
  pleaseRefresh: 'Por favor actualice e intente de nuevo',
  preferred: 'Preferida',
  preparing: 'Preparando',
  preparingDelivery: 'La farmacia está preparando su pedido para la entrega.',
  preparingOrder: 'Preparando su pedido',
  priceDifference: '¿Qué pasa si el precio es diferente?',
  pricesCanChange:
    'Los precios están sujetos a cambios sin previo aviso y pueden variar según la oferta y la demanda. Si hay una gran discrepancia de precios, envíenos un mensaje.',
  quantity: 'Cantidad',
  questionVerb: 'Si tiene alguna pregunta, comuníquese con soporte',
  questionsPhoneNumber: '+1 (513) 866 3212',
  reachOut: 'Si tiene alguna pregunta, comuníquese con su proveedor',
  readyBy: 'Listo para',
  readyPickUp: 'Listo',
  readyWhen: '¿Cuándo necesita que su pedido esté listo?',
  receivedPreparing: 'La farmacia ha recibido su pedido y lo está preparando.',
  refills: 'Resurtidos',
  searchPharmacy: 'Buscar una farmacia',
  selectAPharmacy: 'Seleccionar una farmacia',
  selectPaymentMethod: 'Seleccionar un método de pago',
  selectPharmacy: 'Seleccionar farmacia',
  placeOrder: 'Realizar pedido',
  setLoc: 'Establecer ubicación',
  setSearchLoc: 'Establecer ubicación de búsqueda',
  showThisCoupon: 'Muestre esto en la farmacia para obtener este precio de cupón',
  showingLabel: 'Mostrando farmacias cerca de',
  showMore: 'Mostrar más farmacias',
  thankYou: '¡Gracias!',
  track: 'Rastrear su pedido',
  tracking: 'N.° de seguimiento:',
  learnMore: 'Más información',
  useLoc: 'Usar mi ubicación actual',
  whatIsCouponPrice: '¿Qué es el precio de cupón?',
  whatPaymentMethod: '¿Cómo desea pagar en la farmacia?',

  // Plural variants
  notifyPickUp_singular: 'Por favor notifíquenos abajo cuando haya recogido su receta.',
  notifyPickUp_plural: 'Por favor notifíquenos abajo cuando haya recogido sus recetas.',
  outForDelivery_singular:
    'Su pedido está en camino. Por favor notifíquenos abajo cuando haya recibido su receta.',
  outForDelivery_plural:
    'Su pedido está en camino. Por favor notifíquenos abajo cuando haya recibido sus recetas.',
  pickedUpRx_singular: 'Recogí mi receta',
  pickedUpRx_plural: 'Recogí mis recetas',
  pleaseReview_singular:
    'Por favor revise la receta antes de seleccionar una farmacia. Comuníquese con su proveedor si tiene algún problema.',
  pleaseReview_plural:
    'Por favor revise las recetas antes de seleccionar una farmacia. Comuníquese con su proveedor si tiene algún problema.',
  preparingPickUp_singular: 'La farmacia está preparando su receta para recoger.',
  preparingPickUp_plural: 'La farmacia está preparando sus recetas para recoger.',
  preparingRxDelivery_singular: 'La farmacia está preparando su receta para la entrega.',
  preparingRxDelivery_plural: 'La farmacia está preparando sus recetas para la entrega.',
  preparingTextUs_singular: 'La farmacia está preparando su receta para recoger.',
  preparingTextUs_plural: 'La farmacia está preparando sus recetas para recoger.',
  readyBySelected_singular:
    'Por favor seleccione un horario abajo. Haremos nuestro mejor esfuerzo para que su receta esté lista a la hora seleccionada.',
  readyBySelected_plural:
    'Por favor seleccione un horario abajo. Haremos nuestro mejor esfuerzo para que sus recetas estén listas a la hora seleccionada.',
  receivedRx_singular: 'Recibí mi receta',
  receivedRx_plural: 'Recibí mis recetas',
  reviewRx_singular: 'Revisar receta',
  reviewRx_plural: 'Revisar recetas',
  reviewYourRx_singular: 'Revisar su receta',
  reviewYourRx_plural: 'Revisar sus recetas',
  rxDelivered_singular: 'Su receta ha llegado a su destino.',
  rxDelivered_plural: 'Sus recetas han llegado a su destino.',
  rxInTransit_singular: 'Su receta está en camino a ',
  rxInTransit_plural: 'Sus recetas están en camino a ',
  rxPickedUpTextUs_singular: 'Su receta fue recogida.',
  rxPickedUpTextUs_plural: 'Sus recetas fueron recogidas.',
  rxPickUp_singular: 'Su receta está lista para ser recogida.',
  rxPickUp_plural: 'Sus recetas están listas para ser recogidas.',
  rxReadyNotify_singular:
    'Su receta está lista para ser recogida. Por favor notifíquenos abajo cuando haya recogido su receta.',
  rxReadyNotify_plural:
    'Sus recetas están listas para ser recogidas. Por favor notifíquenos abajo cuando haya recogido sus recetas.',
  sendToNew_singular:
    'Cancelaremos su receta en {{pharmacyName}} y la enviaremos a su nueva farmacia para que la surta.',
  sendToNew_plural:
    'Cancelaremos sus recetas en {{pharmacyName}} y las enviaremos a su nueva farmacia para que las surta.',
  sendToSelected_singular: 'Enviaremos su receta a la farmacia seleccionada para que la surta.',
  sendToSelected_plural: 'Enviaremos sus recetas a la farmacia seleccionada para que las surta.',
  sent_singular: 'Su receta fue enviada a la farmacia.',
  sent_plural: 'Sus recetas fueron enviadas a la farmacia.',
  sentWithOrderSms_singular:
    'Enviamos su receta a la farmacia seleccionada. Le enviaremos mensajes de texto con actualizaciones sobre el estado de su pedido.',
  sentWithOrderSms_plural:
    'Enviamos sus recetas a la farmacia seleccionada. Le enviaremos mensajes de texto con actualizaciones sobre el estado de su pedido.',
  sentWithSms_singular:
    'Su receta fue enviada a la farmacia. Le enviaremos un mensaje de texto para avisarle cuando esté lista.',
  sentWithSms_plural:
    'Sus recetas fueron enviadas a la farmacia. Le enviaremos un mensaje de texto para avisarle cuando estén listas.',
  showCouponToPharmacy_singular:
    'Solo muéstreselo al farmacéutico cuando recoja su receta para no pagar más que el precio del cupón.',
  showCouponToPharmacy_plural:
    'Solo muéstreselo al farmacéutico cuando recoja sus recetas para no pagar más que el precio del cupón.',
  weSent_singular: 'Enviamos su receta a la farmacia.',
  weSent_plural: 'Enviamos sus recetas a la farmacia.',

  // JSX interpolation parts
  selectCashPrice_pre: 'Seleccione',
  cashPrice: 'Precio en efectivo',
  selectCashPrice_mid: 'para ver posibles ahorros, o use',
  insuranceCopay: 'Copago de seguro',
  selectCashPrice_post:
    'para obtener su precio de copago en la farmacia. Puede cambiarlo en cualquier momento.',
  usingWithInsurance_pre:
    'Cualquiera puede usar el cupón. El cupón puede ser menor que el copago de su seguro médico. Puede usarlo',
  instead: 'en lugar',
  usingWithInsurance_post: 'de su copago y no se aplica a su deducible.',
  showDiscountCardPrices_main: 'Mostrar los precios en efectivo más bajos',
  showDiscountCardPrices_sub: 'Puede ser más barato que su seguro',
  shipTo: 'Enviar a {{address}}',

  // Payment method options
  paymentInsuranceLabel: 'Copago de seguro',
  paymentInsuranceDesc: 'Use su tarjeta de seguro para pagar su copago regular de receta',
  payCashLabel: 'Precio en efectivo',
  payCashDesc:
    'Pague sin seguro (algunas farmacias tienen precios con descuento y ocasionalmente pueden ser más baratos que su copago)',

  // ReadyBy
  readyByBusy: 'Las farmacias pueden estar ocupadas',
  readyByLunch: 'Puede verse afectado por el horario de almuerzo',
  readyByUrgentDesc: 'Necesita recoger lo antes posible',
  readyByToday: 'Hoy',
  readyByTomorrow: 'Mañana',

  // FAQ
  faqTitle: 'Preguntas frecuentes',
  faqQ1: '¿Puedo redirigir mi receta o necesito contactar a mi médico?',
  faqA1_pre:
    'Puede redirigir su receta usando el enlace de seguimiento de Photon que se le proporcionó, siempre que no haya sido confirmada en la farmacia. Si la receta ha sido confirmada, debe comunicarse con el soporte de Photon directamente por mensaje de texto al',
  faqA1_post: 'para obtener asistencia.',
  faqQ2: '¿Puedo pagar a Photon directamente por mi receta?',
  faqA2: 'No, no puede pagar a Photon Health directamente por sus recetas. Los pagos se realizan en la farmacia local al recoger los medicamentos, o directamente a la organización proveedora o farmacia si usa un servicio de pedido por correo.',
  faqQ3: '¿Puede Photon pedirle a mi médico que actualice mi receta?',
  faqA3: 'Podemos transmitir problemas a su proveedor con respecto a su receta. Sin embargo, para cualquier problema clínico, incluidas las solicitudes de nuevas recetas, recomendamos comunicarse directamente con su organización proveedora.',
  faqQ4: '¿Photon escribe recetas?',
  faqA4: 'No, Photon Health no escribe ni proporciona recetas. Somos una empresa de enrutamiento de recetas y todas las recetas son escritas por proveedores de atención médica usando nuestras herramientas. Nuestro papel es gestionar la experiencia en la farmacia para los pacientes.',
  faqQ5: '¿Cómo funciona Photon Health?',
  faqA5: 'Photon Health proporciona herramientas de prescripción que ayudan a enviar recetas a la farmacia preferida del paciente. Los consultorios médicos manejan todos los aspectos clínicos y abordan las consultas relacionadas con la empresa. Photon Health apoya el proceso asegurando que las recetas se reciban y procesen con prontitud, actualizando a los pacientes y resolviendo cualquier problema coordinando con la farmacia y el proveedor.',
  faqStillNeedHelp: '¿Aún necesita ayuda?',
  faqSupportText:
    'Si tiene otras preguntas relacionadas con la farmacia, estamos disponibles las 24 horas del día, los 7 días de la semana para brindarle soporte. Generalmente respondemos en 30 minutos.',
  faqMessageSupport: 'Enviar mensaje al soporte',
  faqFeatureUnavailable: 'Función no disponible',
  faqSupportDisabled: 'El soporte está deshabilitado para la demo del paciente',

  // Order Summary
  orderSummaryTitle: 'Resumen del pedido',
  viewDetails: 'Ver detalles',
  noReadyTime: 'No hay hora de entrega disponible',
  shouldBeReady: 'Debería estar listo',
  readyPrefix: 'Listo',
  readyToday: 'hoy',
  readyTomorrow: 'mañana',
  stateDelayed: 'Retrasado',
  statePreparing: 'Preparando',
  stateReady: 'Listo',
  letUsKnow: 'Háganos saber si tiene algún problema',
  saving: 'Guardando...',

  // Exception titles
  exTitle_BACKORDERED: 'Pedido pendiente',
  exTitle_OOS: 'Sin existencias',
  exTitle_PA_REQUIRED: 'Se requiere aprobación del seguro',
  exTitle_REFILL_TOO_SOON: 'Resurtido demasiado pronto',
  exTitle_HIGH_COPAY: 'Alerta de costo alto',
  exTitle_NOT_COVERED: 'No cubierto por el seguro',
  exTitle_RX_CLARIFICATION: 'Necesita aclaración',
  exTitle_OTC: 'Sin receta',
  exTitle_MEDICAL_DEVICE: 'Dispositivo médico',

  // Exception messages
  exMsg_OOS_reroutable:
    'La farmacia no tiene su medicamento en existencia pero puede pedirlo. Puede cambiar su farmacia abajo si lo necesita antes.',
  exMsg_OOS_notReroutable:
    'La farmacia no tiene su medicamento en existencia pero puede pedirlo. Contáctenos si lo necesita antes.',
  exMsg_BACKORDERED:
    'La farmacia no puede pedir el medicamento. Contacte a su proveedor para alternativas o cambie su farmacia.',
  exMsg_PA_REQUIRED:
    'Su seguro necesita información de su proveedor para cubrir este medicamento. Contacte a su proveedor para alternativas o pague el precio en efectivo.',
  exMsg_REFILL_TOO_SOON:
    'Su seguro informó a la farmacia que es demasiado pronto para un resurtido. Puede esperar, o puede pagar en efectivo o usar una tarjeta de descuento si lo necesita antes.',
  exMsg_NOT_COVERED:
    'Esta receta puede no estar cubierta por su seguro. Aún puede pagar en efectivo o usar una tarjeta de descuento. Su proveedor también puede ayudarle a encontrar una alternativa cubierta.',
  exMsg_HIGH_COPAY:
    'Este medicamento puede tener un costo de bolsillo alto. Es posible que pueda usar una tarjeta de descuento y pagar significativamente menos.',
  exMsg_RX_CLARIFICATION:
    'Su farmacia necesita hablar con su proveedor antes de surtir su receta. Ya nos hemos comunicado con ellos.',
  exMsg_OTC:
    'Su farmacia nos ha informado que el medicamento que se le recetó está disponible sin receta y puede recogerse en el pasillo correspondiente de su farmacia local.',
  exMsg_MEDICAL_DEVICE:
    'Esta farmacia no tiene este dispositivo en existencia y no puede surtir su receta. Este producto está disponible sin receta en una tienda de suministros médicos o en línea.',

  // PharmacyInfo tags
  couponPrice: 'Precio con cupón',
  retail: 'Precio regular',
  readyIn30: 'Listo en 30 minutos',
  availableInArea: 'Disponible en su área',
  freeDelivery: 'Entrega gratis',
  inStock: 'En existencia',
  avgCopayPrice: 'Copago promedio',
  asLowAs: 'Desde',
  freeExpressDelivery: 'Entrega exprés gratis',
  currentPharmacy: 'Farmacia actual',

  // Status page
  pharmacy: 'Farmacia',
  needHelp: '¿Necesita ayuda?',
  pharmacyIssue: 'Tengo un problema con la farmacia',
  holidayAlert: 'Los días festivos pueden afectar el horario de la farmacia.',

  // Info page
  orderSent: 'Pedido enviado',
  yourOrderSentToPharmacy: 'Su pedido fue enviado a la farmacia',

  // Pharmacy page toasts
  toastUnableChange: 'No se puede cambiar de farmacia',
  toastAlreadyProcessing:
    'Su pedido ya está siendo procesado. Envíenos un mensaje si necesita enviarlo a una farmacia diferente.',
  toastUnableSubmit: 'No se puede enviar la selección de farmacia',
  toastInvalidLocation: 'Ubicación inválida',
  toastUpdateLocation: 'Por favor actualice su ubicación e intente de nuevo.',
  toastSetPreferred: 'Farmacia preferida establecida',
  toastUnableSetPreferred: 'No se pudo establecer la farmacia preferida',
  toastNoPharmaciesNear: 'No se encontraron farmacias cerca de la ubicación',
  toastUnableGetPharmacies: 'No se pudieron obtener las farmacias',

  // Pharmacy page inline
  couponGeneratedAfterSelect: 'El cupón se generará después de que seleccione una farmacia.',
  moreInfo: 'Más información',
  dontSeePharmacy: '¿No encuentra su farmacia?',
  seeAllMailOrders: 'Ver todas las farmacias de pedido postal',

  // ReadyBy display labels
  readyByUrgentLabel: 'Urgente',
  readyByAfterHoursLabel: 'Fuera de horario',

  // ReadyText
  readyAt: 'Listo a las',
  tomorrowAt: 'mañana a las',
  needOrderPre: 'Necesito el pedido',
  asap: 'lo antes posible',
  thisEvening: 'esta tarde',
  tomorrowEvening: 'mañana por la tarde',
  needOrderByPre: 'Necesito el pedido para',

  // Header status headings
  headerCantProcess: 'No se puede procesar el pedido',
  headerOrderPlaced: 'Pedido realizado',
  headerOrderError: 'Error en el pedido',
  headerOrderIssue: 'Problema con el pedido',
  headerOrderTransferred: 'Pedido transferido',
  headerOrderDelayed: 'Pedido retrasado',
  headerPreparingOrder: 'Preparando su pedido...',
  headerOrderComplete: 'Pedido completado',
  headerOrderLikelyReady: 'El pedido probablemente está listo',
  headerOrderDelivered: 'Pedido entregado',
  headerOrderInTransit: 'Pedido en tránsito',

  // Header subheadings
  subPleaseReview: 'Por favor revise su pedido para más detalles.',
  subPharmacyUnreachable:
    'No podemos obtener actualizaciones de su pedido. Puede llamar a su farmacia actual o cambiar de farmacia a continuación.',
  subPharmacyClosed: 'Su farmacia está cerrada. Puede cambiarla si necesita su pedido antes.',
  subOrderError: 'No se pudo enviar a la farmacia. Por favor seleccione una nueva farmacia a continuación.',
  subDemographicMismatch:
    'Por favor comuníquese con su proveedor con el nombre legal correcto / fecha de nacimiento / dirección para que le escriba una nueva receta.',
  subExternalTransfer: 'Por favor contacte a su farmacia original si tiene preguntas.',
  subDoctorNotLicensed: 'Por favor contacte a su proveedor para resolver este problema.',
  subMailOrderSent: 'Hemos enviado su pedido a la farmacia. Se pondrán en contacto pronto.',
  subConfirmingOrder: 'Estamos confirmando su pedido con la farmacia.',
  subEstimateReady: 'Nuestra estimación se basa en el tiempo que proporcionó la farmacia',
  subOutForDelivery: 'Su pedido está en camino',
  subPharmacyReceived: 'Su farmacia ha recibido su pedido.',
  subPrescriptionsReady: 'Sus recetas deberían estar listas',
  requestedPickup: 'Recogida solicitada:',
  urgentReadyBy: 'Lo antes posible',
  tomorrowAtPrefix: 'Mañana a las',

  // PrescriptionsList
  orderDetails: 'Detalles del pedido',
  showLess: 'Ver menos',
  showMoreDetails: 'Ver más',

  // EmbeddedCouponCard
  retailPriceLabel: 'Precio al por menor:',

  // MailOrderSelectModal
  mailOrderPharmacies: 'Farmacias de pedido por correo',
  cantFindPharmacy: 'Si no encuentra su farmacia, comuníquese con su proveedor.',

  // OfferInfo
  sponsored: 'Patrocinado',
  sponsoredTooltip:
    'Esta farmacia ha pagado por colocación preferida. Photon Health no respalda esta farmacia sobre otras. Otras farmacias pueden ofrecer este medicamento al mismo precio o similar.',
};

export default es;
