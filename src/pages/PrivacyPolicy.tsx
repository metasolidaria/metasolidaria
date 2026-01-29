import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </Button>

        <h1 className="text-3xl font-bold text-foreground mb-8">
          Política de Privacidade
        </h1>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm">
            Última atualização: 29 de janeiro de 2026
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              1. Introdução
            </h2>
            <p>
              A Meta Solidária ("nós", "nosso" ou "aplicativo") está comprometida em proteger 
              a privacidade dos nossos usuários. Esta Política de Privacidade explica como 
              coletamos, usamos, armazenamos e protegemos suas informações pessoais quando 
              você utiliza nossa plataforma de doações solidárias.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              2. Informações que Coletamos
            </h2>
            <p>Coletamos os seguintes tipos de informações:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Informações de cadastro:</strong> nome completo, endereço de e-mail, 
                número de WhatsApp e cidade.
              </li>
              <li>
                <strong>Informações de uso:</strong> dados sobre sua participação em grupos, 
                metas de doação e progresso registrado.
              </li>
              <li>
                <strong>Informações técnicas:</strong> tipo de dispositivo, navegador e 
                dados de acesso para melhorar a experiência do usuário.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              3. Como Usamos suas Informações
            </h2>
            <p>Utilizamos suas informações para:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Criar e gerenciar sua conta na plataforma</li>
              <li>Facilitar sua participação em grupos de doação</li>
              <li>Permitir a comunicação entre líderes e membros de grupos</li>
              <li>Calcular e exibir estatísticas de impacto social</li>
              <li>Enviar notificações relacionadas às suas atividades</li>
              <li>Melhorar nossos serviços e experiência do usuário</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              4. Compartilhamento de Informações
            </h2>
            <p>
              Suas informações pessoais são compartilhadas de forma limitada:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Dentro dos grupos:</strong> seu nome é visível para outros membros 
                do grupo. Seu WhatsApp é visível apenas para o líder do grupo.
              </li>
              <li>
                <strong>Estatísticas públicas:</strong> dados agregados e anônimos sobre 
                doações são exibidos publicamente para demonstrar o impacto coletivo.
              </li>
              <li>
                <strong>Parceiros:</strong> não compartilhamos suas informações pessoais 
                com parceiros comerciais sem seu consentimento explícito.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              5. Segurança dos Dados
            </h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger 
              suas informações, incluindo:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Controle de acesso baseado em funções (RLS)</li>
              <li>Autenticação segura com verificação de e-mail</li>
              <li>Monitoramento contínuo de segurança</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              6. Seus Direitos
            </h2>
            <p>
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou incorretos</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Revogar seu consentimento a qualquer momento</li>
              <li>Solicitar a portabilidade dos seus dados</li>
            </ul>
            <p className="mt-4">
              Para exercer esses direitos, entre em contato conosco através do WhatsApp 
              disponível no rodapé do aplicativo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              7. Retenção de Dados
            </h2>
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário 
              para fornecer nossos serviços. Você pode solicitar a exclusão da sua conta 
              a qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              8. Cookies e Tecnologias Similares
            </h2>
            <p>
              Utilizamos cookies e tecnologias similares para manter sua sessão ativa 
              e melhorar sua experiência. Você pode configurar seu navegador para 
              recusar cookies, mas isso pode afetar algumas funcionalidades do aplicativo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              9. Alterações nesta Política
            </h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos 
              você sobre alterações significativas através do aplicativo ou por e-mail.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              10. Contato
            </h2>
            <p>
              Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como 
              tratamos seus dados, entre em contato conosco:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>WhatsApp:</strong>{" "}
                <a 
                  href="https://wa.me/5519994662603" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  +55 19 99466-2603
                </a>
              </li>
              <li>
                <strong>Instagram:</strong>{" "}
                <a 
                  href="https://instagram.com/metasolidaria" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  @metasolidaria
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2026 Meta Solidária. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
