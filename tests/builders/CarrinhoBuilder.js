import { Carrinho } from '../../src/domain/Carrinho.js';
import { Item } from '../../src/domain/Item.js';
import { UserMother } from './UserMother.js';

/**
 * Data Builder Pattern para Carrinho
 * 
 * Este padrão é ideal para objetos complexos que variam muito entre testes.
 * Oferece uma API fluente (method chaining) que torna explícito apenas
 * o que é importante para cada cenário de teste específico.
 * 
 * Resolve o Test Smell "Obscure Setup" (Setup Obscuro).
 */
export class CarrinhoBuilder {
    
    constructor() {
        // Valores padrão razoáveis
        // Um carrinho "padrão" tem um usuário comum e um item simples
        this.user = UserMother.umUsuarioPadrao();
        this.itens = [
            new Item('Produto Padrão', 100.00)
        ];
    }

    /**
     * Define o usuário do carrinho
     * @param {User} user - Usuário do carrinho
     * @returns {CarrinhoBuilder} - Retorna this para method chaining
     */
    comUser(user) {
        this.user = user;
        return this;
    }

    /**
     * Define os itens do carrinho
     * @param {Item[]} itens - Array de itens
     * @returns {CarrinhoBuilder} - Retorna this para method chaining
     */
    comItens(itens) {
        this.itens = itens;
        return this;
    }

    /**
     * Adiciona um único item ao carrinho
     * @param {Item} item - Item a ser adicionado
     * @returns {CarrinhoBuilder} - Retorna this para method chaining
     */
    comItem(item) {
        this.itens.push(item);
        return this;
    }

    /**
     * Cria um carrinho vazio (sem itens)
     * @returns {CarrinhoBuilder} - Retorna this para method chaining
     */
    vazio() {
        this.itens = [];
        return this;
    }

    /**
     * Cria um carrinho com um valor total específico
     * Útil quando o valor exato importa para o teste
     * @param {number} valorTotal - Valor total desejado
     * @returns {CarrinhoBuilder} - Retorna this para method chaining
     */
    comValorTotal(valorTotal) {
        this.itens = [new Item('Item de Teste', valorTotal)];
        return this;
    }

    /**
     * Cria um carrinho com múltiplos itens de valores específicos
     * @param {number[]} valores - Array com os valores de cada item
     * @returns {CarrinhoBuilder} - Retorna this para method chaining
     */
    comItensDeValores(...valores) {
        this.itens = valores.map((valor, index) => 
            new Item(`Item ${index + 1}`, valor)
        );
        return this;
    }

    /**
     * Constrói e retorna a instância final do Carrinho
     * @returns {Carrinho} - Instância do carrinho configurado
     */
    build() {
        return new Carrinho(this.user, this.itens);
    }
}