import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
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
          Termos de Uso
        </h1>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm">
            Última atualização: 31 de janeiro de 2026
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              1. Aceitação dos Termos
            </h2>
            <p>
              Ao acessar ou utilizar a plataforma Meta Solidária ("Plataforma", "nós" ou "nosso"), 
              você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não 
              concordar com qualquer parte destes termos, não poderá acessar ou utilizar 
              nossos serviços.
            </p>
            <p className="mt-2">
              Estes termos constituem um acordo legal entre você ("Usuário") e a Meta Solidária, 
              regulando o uso da plataforma e todos os serviços relacionados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              2. Descrição do Serviço
            </h2>
            <p>
              A Meta Solidária é uma plataforma digital que facilita a organização e 
              acompanhamento de doações solidárias através de grupos. Nossa missão é 
              conectar pessoas dispostas a ajudar com iniciativas de impacto social.
            </p>
            <p className="mt-2">
              A plataforma oferece:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Criação e gestão de grupos de doação</li>
              <li>Acompanhamento de metas e progresso de doações</li>
              <li>Conexão entre doadores e instituições beneficentes</li>
              <li>Estatísticas de impacto social coletivo</li>
              <li>Comunicação entre líderes e membros de grupos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              3. Elegibilidade
            </h2>
            <p>
              Para utilizar a Meta Solidária, você deve:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Ter pelo menos 18 anos de idade ou possuir autorização de um responsável legal</li>
              <li>Possuir capacidade legal para celebrar contratos vinculantes</li>
              <li>Não ter sido previamente suspenso ou removido da plataforma</li>
              <li>Fornecer informações verdadeiras e precisas durante o cadastro</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              4. Cadastro e Conta
            </h2>
            <p>
              Ao criar uma conta na Meta Solidária, você se compromete a:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Fornecer informações verdadeiras, precisas e completas</li>
              <li>Manter suas informações de cadastro atualizadas</li>
              <li>Manter a confidencialidade de sua senha e dados de acesso</li>
              <li>Notificar imediatamente qualquer uso não autorizado de sua conta</li>
              <li>Ser responsável por todas as atividades realizadas em sua conta</li>
            </ul>
            <p className="mt-4">
              Reservamo-nos o direito de suspender ou encerrar contas que violem estes 
              termos ou que apresentem comportamento inadequado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              5. Doações
            </h2>
            <p>
              A Meta Solidária facilita a organização de doações, mas não processa 
              transações financeiras. Esclarecemos que:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Natureza voluntária:</strong> Todas as doações são voluntárias 
                e realizadas diretamente entre doadores e instituições beneficentes
              </li>
              <li>
                <strong>Sem intermediação financeira:</strong> A plataforma não coleta, 
                processa ou transfere valores monetários
              </li>
              <li>
                <strong>Registro de progresso:</strong> Os usuários registram suas doações 
                para acompanhamento de metas, mas a veracidade é de responsabilidade do usuário
              </li>
              <li>
                <strong>Metas e compromissos:</strong> Os compromissos de doação são 
                incentivos pessoais e não constituem obrigação legal
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              6. Conteúdo do Usuário
            </h2>
            <p>
              Ao enviar conteúdo para a plataforma (informações de grupos, descrições, 
              imagens, etc.), você:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Declara ser o proprietário ou ter autorização para usar tal conteúdo</li>
              <li>Concede à Meta Solidária licença para usar, exibir e distribuir o conteúdo</li>
              <li>Assume total responsabilidade pelo conteúdo publicado</li>
              <li>Garante que o conteúdo não viola direitos de terceiros</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              7. Uso Aceitável
            </h2>
            <p>
              Ao utilizar a Meta Solidária, você concorda em NÃO:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Usar a plataforma para fins ilegais ou não autorizados</li>
              <li>Publicar conteúdo falso, enganoso, difamatório ou ofensivo</li>
              <li>Praticar spam, phishing ou qualquer forma de fraude</li>
              <li>Coletar dados de outros usuários sem autorização</li>
              <li>Interferir no funcionamento da plataforma ou seus sistemas</li>
              <li>Criar contas falsas ou se passar por outra pessoa</li>
              <li>Usar a plataforma para promoção comercial não autorizada</li>
              <li>Assediar, intimidar ou discriminar outros usuários</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              8. Propriedade Intelectual
            </h2>
            <p>
              Todos os direitos de propriedade intelectual relacionados à Meta Solidária, 
              incluindo mas não limitado a:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Nome, marca e logotipo da Meta Solidária</li>
              <li>Design, layout e interface da plataforma</li>
              <li>Código-fonte, software e tecnologia subjacente</li>
              <li>Conteúdo original produzido pela equipe</li>
            </ul>
            <p className="mt-4">
              São de propriedade exclusiva da Meta Solidária e estão protegidos pelas 
              leis de propriedade intelectual aplicáveis. O uso não autorizado é 
              expressamente proibido.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              9. Limitação de Responsabilidade
            </h2>
            <p>
              A Meta Solidária é fornecida "como está", sem garantias de qualquer tipo. 
              Não nos responsabilizamos por:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Interrupções, erros ou falhas técnicas da plataforma</li>
              <li>Perda de dados ou informações</li>
              <li>Ações de terceiros, incluindo outros usuários</li>
              <li>Doações não realizadas ou realizadas incorretamente</li>
              <li>Danos diretos, indiretos, incidentais ou consequentes</li>
              <li>Veracidade das informações fornecidas por usuários</li>
            </ul>
            <p className="mt-4">
              Você concorda em usar a plataforma por sua conta e risco.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              10. Alterações nos Termos
            </h2>
            <p>
              Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. 
              As alterações entrarão em vigor imediatamente após a publicação na plataforma.
            </p>
            <p className="mt-2">
              Notificaremos os usuários sobre alterações significativas através de:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Aviso na plataforma</li>
              <li>Email para usuários cadastrados</li>
              <li>Atualização da data "Última atualização" nesta página</li>
            </ul>
            <p className="mt-4">
              O uso continuado da plataforma após as alterações constitui aceitação 
              dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              11. Disposições Gerais
            </h2>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Lei aplicável:</strong> Estes termos são regidos pelas leis da 
                República Federativa do Brasil
              </li>
              <li>
                <strong>Foro:</strong> Fica eleito o foro da comarca de Campinas/SP para 
                dirimir quaisquer controvérsias
              </li>
              <li>
                <strong>Integralidade:</strong> Estes termos constituem o acordo integral 
                entre as partes
              </li>
              <li>
                <strong>Renúncia:</strong> A falha em exercer qualquer direito não 
                constitui renúncia a tal direito
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              12. Contato
            </h2>
            <p>
              Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco:
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

export default TermsOfService;
