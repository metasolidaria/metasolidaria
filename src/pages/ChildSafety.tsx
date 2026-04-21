import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Mail, FileWarning, Users, Gavel, ArrowLeft } from "lucide-react";

const ChildSafety = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </Button>
        <div className="space-y-8">
          <header className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Política de Segurança Infantil
            </h1>
            <p className="text-muted-foreground text-lg">
              Compromisso do MetaSolidária contra abuso e exploração sexual infantil (CSAE/CSAM)
            </p>
            <p className="text-sm text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </header>

          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Nosso Compromisso</h2>
            </div>
            <p className="text-foreground/90 leading-relaxed">
              O MetaSolidária possui <strong>tolerância zero</strong> com qualquer forma de abuso sexual infantil,
              exploração de crianças e adolescentes, ou material de abuso sexual infantil (CSAM — Child Sexual
              Abuse Material). Estamos comprometidos em manter uma plataforma segura, respeitosa e protegida
              para todos os usuários, especialmente menores de idade.
            </p>
            <p className="text-foreground/90 leading-relaxed">
              Esta política está em conformidade com a legislação brasileira (ECA — Estatuto da Criança e do
              Adolescente, Lei nº 8.069/1990) e com os padrões internacionais de combate ao CSAE (Child Sexual
              Abuse and Exploitation), incluindo as diretrizes da Google Play Store.
            </p>
          </section>

          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-3">
              <FileWarning className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Conteúdo Proibido</h2>
            </div>
            <p className="text-foreground/90 leading-relaxed">
              É <strong>estritamente proibido</strong> no MetaSolidária:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li>Publicar, compartilhar, armazenar ou distribuir qualquer material que retrate abuso sexual infantil (CSAM);</li>
              <li>Aliciamento de menores (grooming) ou tentativas de contato com fins de exploração;</li>
              <li>Conteúdo que sexualize crianças ou adolescentes, mesmo que ilustrado, animado ou gerado por IA;</li>
              <li>Promoção, facilitação ou normalização da exploração sexual infantil;</li>
              <li>Compartilhamento de informações pessoais de menores sem o consentimento dos responsáveis;</li>
              <li>Qualquer interação que coloque em risco a integridade física, emocional ou sexual de menores.</li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Como Denunciar</h2>
            </div>
            <p className="text-foreground/90 leading-relaxed">
              Se você encontrar qualquer conteúdo, comportamento ou usuário que viole esta política, denuncie
              imediatamente. Tratamos todas as denúncias com <strong>prioridade máxima e total confidencialidade</strong>.
            </p>
            <div className="bg-muted/50 rounded-md p-4 space-y-2">
              <p className="font-semibold text-foreground">Canais de denúncia:</p>
              <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-2">
                <li>
                  <strong>E-mail dedicado:</strong>{" "}
                  <a
                    href="mailto:pierohsbueno@gmail.com?subject=Denúncia%20de%20Segurança%20Infantil%20-%20MetaSolidária"
                    className="text-primary hover:underline font-medium"
                  >
                    pierohsbueno@gmail.com
                  </a>
                </li>
                <li>
                  <strong>Dentro do aplicativo:</strong> use o botão de denúncia disponível em grupos, perfis e
                  conteúdos publicados;
                </li>
                <li>
                  <strong>Disque 100:</strong> Disque Direitos Humanos do Governo Federal — atendimento 24h, gratuito e anônimo;
                </li>
                <li>
                  <strong>SaferNet Brasil:</strong>{" "}
                  <a
                    href="https://new.safernet.org.br/denuncie"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    new.safernet.org.br/denuncie
                  </a>
                </li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Ao denunciar, forneça o máximo de detalhes possível: link, nome do usuário, descrição do conteúdo
              e capturas de tela (se possível).
            </p>
          </section>

          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Moderação e Remoção de Conteúdo</h2>
            </div>
            <p className="text-foreground/90 leading-relaxed">
              Nossa equipe de moderação atua de forma proativa e reativa para garantir a segurança da plataforma:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li>
                <strong>Resposta rápida:</strong> denúncias relacionadas à segurança infantil são analisadas em
                até 24 horas, com prioridade sobre qualquer outra demanda;
              </li>
              <li>
                <strong>Remoção imediata:</strong> qualquer conteúdo confirmado como CSAM ou que viole esta
                política é removido imediatamente da plataforma;
              </li>
              <li>
                <strong>Banimento:</strong> contas envolvidas em violações são permanentemente banidas, sem
                possibilidade de recuperação;
              </li>
              <li>
                <strong>Preservação de evidências:</strong> mantemos registros das violações para colaborar com
                investigações das autoridades competentes;
              </li>
              <li>
                <strong>Revisão humana:</strong> toda denúncia é avaliada por moderadores treinados, garantindo
                análise cuidadosa e justa.
              </li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-3">
              <Gavel className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Encaminhamento às Autoridades</h2>
            </div>
            <p className="text-foreground/90 leading-relaxed">
              O MetaSolidária colabora ativamente com as autoridades competentes no combate à exploração
              sexual infantil:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li>
                Todo conteúdo identificado como CSAM é <strong>denunciado obrigatoriamente</strong> à Polícia
                Federal e à SaferNet Brasil (NCMEC parceira no Brasil);
              </li>
              <li>
                Cooperamos com investigações judiciais e fornecemos dados solicitados mediante ordem judicial,
                conforme o Marco Civil da Internet (Lei nº 12.965/2014);
              </li>
              <li>
                Casos de aliciamento ou exploração de menores são reportados ao Ministério Público e ao
                Conselho Tutelar competente;
              </li>
              <li>
                Mantemos canal aberto com o Disque 100 e demais órgãos de proteção à criança e ao adolescente.
              </li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Medidas Preventivas</h2>
            </div>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li>Treinamento contínuo da equipe sobre identificação e tratamento de casos de CSAE;</li>
              <li>Revisão periódica de conteúdo público e perfis cadastrados;</li>
              <li>Restrições de cadastro e funcionalidades sensíveis para menores de 18 anos;</li>
              <li>Atualização constante de mecanismos de detecção e moderação;</li>
              <li>Educação dos usuários sobre práticas seguras na plataforma.</li>
            </ul>
          </section>

          <section className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Contato</h2>
            </div>
            <p className="text-foreground/90 leading-relaxed">
              Para denúncias, dúvidas ou solicitações relacionadas à segurança infantil, entre em contato com
              nosso responsável:
            </p>
            <div className="bg-card rounded-md p-4 border border-border">
              <p className="text-foreground">
                <strong>E-mail:</strong>{" "}
                <a
                  href="mailto:pierohsbueno@gmail.com?subject=Segurança%20Infantil%20-%20MetaSolidária"
                  className="text-primary hover:underline font-medium"
                >
                  pierohsbueno@gmail.com
                </a>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Respondemos a todas as comunicações sobre segurança infantil em até 24 horas úteis.
              </p>
            </div>
          </section>

          <section className="text-center text-sm text-muted-foreground pt-4">
            <p>
              Esta política pode ser atualizada periodicamente. Recomendamos consultá-la regularmente para se
              manter informado sobre nossas práticas de segurança.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChildSafety;
