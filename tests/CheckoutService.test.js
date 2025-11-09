import { CheckoutService } from "../src/services/CheckoutService.js";
import { CarrinhoBuilder } from "./builders/CarrinhoBuilder.js";
import { UserMother } from "./builders/UserMother.js";

/**
 * Testes do CheckoutService
 *
 * Este arquivo demonstra o uso de Test Patterns:
 * - Object Mother (UserMother)
 * - Data Builder (CarrinhoBuilder)
 * - Test Doubles (Stubs e Mocks)
 * - Padrão AAA (Arrange, Act, Assert)
 */
describe("CheckoutService", () => {
  /**
   * ETAPA 4: Teste com STUB - Verificação de Estado
   *
   * Stub: Um test double que fornece respostas pré-definidas
   * Foco: O que o sistema retorna (ESTADO), não como ele se comporta
   *
   * Cenário: Pagamento falha no gateway
   * Expectativa: O método deve retornar null (estado de falha)
   */
  describe("quando o pagamento falha", () => {
    it("deve retornar null e não processar o pedido", async () => {
      // ==================== ARRANGE ====================

      // 1. Criar o carrinho usando o Builder
      const carrinho = new CarrinhoBuilder()
        .comUser(UserMother.umUsuarioPadrao())
        .comValorTotal(150.0)
        .build();

      // 2. Criar STUB para GatewayPagamento
      // Um Stub apenas retorna valores pré-definidos
      // Aqui, simulamos uma falha no pagamento
      const gatewayStub = {
        cobrar: jest.fn().mockResolvedValue({
          success: false,
          error: "Cartão recusado",
        }),
      };

      // 3. Criar DUMMIES para as outras dependências
      // Dummies são objetos que não devem ser chamados
      // Apenas preenchem os parâmetros obrigatórios
      const repositoryDummy = {
        salvar: jest.fn(),
      };

      const emailDummy = {
        enviarEmail: jest.fn(),
      };

      // 4. Criar o CheckoutService com as dependências injetadas
      const checkoutService = new CheckoutService(
        gatewayStub,
        repositoryDummy,
        emailDummy
      );

      const cartaoCredito = "1234-5678-9012-3456";

      // ==================== ACT ====================
      const pedido = await checkoutService.processarPedido(
        carrinho,
        cartaoCredito
      );

      // ==================== ASSERT ====================

      // Verificação de ESTADO: o resultado deve ser null
      expect(pedido).toBeNull();

      // Verificações adicionais (opcional, mas boa prática):

      // O gateway foi chamado com o valor correto?
      expect(gatewayStub.cobrar).toHaveBeenCalledWith(150.0, cartaoCredito);

      // Repository NÃO deve ter sido chamado (pedido não foi salvo)
      expect(repositoryDummy.salvar).not.toHaveBeenCalled();

      // Email NÃO deve ter sido enviado
      expect(emailDummy.enviarEmail).not.toHaveBeenCalled();
    });

    it("deve retornar null mesmo para carrinho vazio", async () => {
      // ==================== ARRANGE ====================
      const carrinho = new CarrinhoBuilder().vazio().build();

      const gatewayStub = {
        cobrar: jest.fn().mockResolvedValue({ success: false }),
      };

      const repositoryDummy = { salvar: jest.fn() };
      const emailDummy = { enviarEmail: jest.fn() };

      const checkoutService = new CheckoutService(
        gatewayStub,
        repositoryDummy,
        emailDummy
      );

      // ==================== ACT ====================
      const pedido = await checkoutService.processarPedido(
        carrinho,
        "1111-2222-3333-4444"
      );

      // ==================== ASSERT ====================
      expect(pedido).toBeNull();
      expect(gatewayStub.cobrar).toHaveBeenCalledWith(0, "1111-2222-3333-4444");
    });
  });

  /**
   * Teste adicional: Verificar que usuário padrão não recebe desconto
   * Também usa Stub, mas foca em outro aspecto do estado
   */
  describe("quando um cliente padrão finaliza a compra", () => {
    it("não deve aplicar desconto no valor total", async () => {
      // ==================== ARRANGE ====================
      const carrinho = new CarrinhoBuilder()
        .comUser(UserMother.umUsuarioPadrao())
        .comValorTotal(200.0)
        .build();

      const gatewayStub = {
        cobrar: jest.fn().mockResolvedValue({ success: false }),
      };

      const repositoryDummy = { salvar: jest.fn() };
      const emailDummy = { enviarEmail: jest.fn() };

      const checkoutService = new CheckoutService(
        gatewayStub,
        repositoryDummy,
        emailDummy
      );

      // ==================== ACT ====================
      await checkoutService.processarPedido(carrinho, "5555-6666-7777-8888");

      // ==================== ASSERT ====================
      // Verifica que o gateway foi chamado com o valor INTEGRAL (sem desconto)
      expect(gatewayStub.cobrar).toHaveBeenCalledWith(
        200.0,
        "5555-6666-7777-8888"
      );
    });
  });

  /**
   * ETAPA 5: Teste com MOCK - Verificação de Comportamento
   *
   * Mock: Um test double que verifica INTERAÇÕES (como o sistema se comporta)
   * Foco: COMO o sistema se comporta, quais métodos foram chamados e com quais argumentos
   *
   * Cenário: Cliente Premium finaliza compra com sucesso
   * Expectativas:
   * 1. Desconto de 10% deve ser aplicado
   * 2. Gateway deve ser cobrado com valor COM desconto
   * 3. Email deve ser enviado (verificação de comportamento)
   */
  describe("quando um cliente Premium finaliza a compra", () => {
    it("deve aplicar desconto de 10% e enviar email de confirmação", async () => {
      // ==================== ARRANGE ====================

      // 1. Criar usuário Premium usando Object Mother
      const usuarioPremium = UserMother.umUsuarioPremium();

      // 2. Criar carrinho com R$ 200,00 usando Data Builder
      const carrinho = new CarrinhoBuilder()
        .comUser(usuarioPremium)
        .comValorTotal(200.0)
        .build();

      // 3. Criar STUB para GatewayPagamento (retorna sucesso)
      const gatewayStub = {
        cobrar: jest.fn().mockResolvedValue({
          success: true,
          transacaoId: "TXN-12345",
        }),
      };

      // 4. Criar STUB para PedidoRepository (retorna pedido salvo)
      const repositoryStub = {
        salvar: jest.fn().mockResolvedValue({
          id: "PED-001",
          carrinho: carrinho,
          totalFinal: 180.0,
          status: "PROCESSADO",
        }),
      };

      // 5. Criar MOCK para EmailService
      // Este é um MOCK porque vamos verificar SE foi chamado e COMO foi chamado
      const emailMock = {
        enviarEmail: jest.fn().mockResolvedValue(true),
      };

      // 6. Injetar dependências no CheckoutService
      const checkoutService = new CheckoutService(
        gatewayStub,
        repositoryStub,
        emailMock
      );

      const cartaoCredito = "9999-8888-7777-6666";

      // ==================== ACT ====================
      const pedido = await checkoutService.processarPedido(
        carrinho,
        cartaoCredito
      );

      // ==================== ASSERT ====================

      // 1. Verificação de ESTADO: O pedido foi processado com sucesso
      expect(pedido).not.toBeNull();
      expect(pedido.status).toBe("PROCESSADO");

      // 2. Verificação de COMPORTAMENTO: Gateway foi chamado com valor COM DESCONTO
      // R$ 200,00 - 10% = R$ 180,00
      expect(gatewayStub.cobrar).toHaveBeenCalledWith(180, cartaoCredito);
      expect(gatewayStub.cobrar).toHaveBeenCalledTimes(1);

      // 3. Verificação de COMPORTAMENTO: Email foi enviado (MOCK)
      // Verificamos que o método foi chamado EXATAMENTE 1 vez
      expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);

      // 4. Verificação de COMPORTAMENTO: Email foi chamado com argumentos corretos
      expect(emailMock.enviarEmail).toHaveBeenCalledWith(
        "premium@email.com",
        "Seu Pedido foi Aprovado!",
        "Pedido PED-001 no valor de R$180"
      );
    });

    it("deve processar pedido mesmo se envio de email falhar", async () => {
      // ==================== ARRANGE ====================
      const usuarioPremium = UserMother.umUsuarioPremium();

      const carrinho = new CarrinhoBuilder()
        .comUser(usuarioPremium)
        .comValorTotal(100.0)
        .build();

      const gatewayStub = {
        cobrar: jest.fn().mockResolvedValue({ success: true }),
      };

      const repositoryStub = {
        salvar: jest.fn().mockResolvedValue({
          id: "PED-002",
          carrinho: carrinho,
          totalFinal: 90.0,
          status: "PROCESSADO",
        }),
      };

      // Mock que simula falha no envio de email
      const emailMock = {
        enviarEmail: jest
          .fn()
          .mockRejectedValue(new Error("Servidor de email indisponível")),
      };

      const checkoutService = new CheckoutService(
        gatewayStub,
        repositoryStub,
        emailMock
      );

      // ==================== ACT ====================
      const pedido = await checkoutService.processarPedido(
        carrinho,
        "1111-2222-3333-4444"
      );

      // ==================== ASSERT ====================

      // O pedido deve ser processado mesmo com falha no email
      expect(pedido).not.toBeNull();
      expect(pedido.id).toBe("PED-002");

      // Verifica que tentou enviar o email
      expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);
    });
  });
});
