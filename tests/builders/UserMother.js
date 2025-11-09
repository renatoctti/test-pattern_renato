import { User } from '../../src/domain/User.js';

/**
 * Object Mother Pattern para User
 * 
 * Este padrão é útil para criar instâncias fixas e simples de objetos
 * que não variam muito entre os testes. Cada método estático retorna
 * um tipo específico de usuário com dados pré-definidos.
 */
export class UserMother {
    
    /**
     * Cria um usuário padrão (não-premium)
     * Útil para testes onde o tipo de usuário não importa
     * ou quando queremos testar comportamento de usuários comuns
     */
    static umUsuarioPadrao() {
        return new User(
            1,
            'João Silva',
            'joao@email.com',
            'PADRAO'
        );
    }

    /**
     * Cria um usuário premium
     * Útil para testes que verificam regras de negócio específicas
     * para clientes premium (como descontos)
     */
    static umUsuarioPremium() {
        return new User(
            2,
            'Maria Santos',
            'premium@email.com',
            'PREMIUM'
        );
    }

    /**
     * Cria um usuário padrão com email customizado
     * Útil quando precisamos verificar o envio de email para um endereço específico
     */
    static umUsuarioPadraoComEmail(email) {
        return new User(
            1,
            'João Silva',
            email,
            'PADRAO'
        );
    }

    /**
     * Cria um usuário premium com email customizado
     * Combina a flexibilidade de email personalizado com tipo premium
     */
    static umUsuarioPremiumComEmail(email) {
        return new User(
            2,
            'Maria Santos',
            email,
            'PREMIUM'
        );
    }
}