import { PageHeader } from '../components/PageHeader';

const Noticias = () => {
  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Notícias" 
        backgroundImage="/assets/event_bg_visitor.png"
        icon="/assets/Newspaper.png"
      />
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-habbo-text mb-4">Últimas Notícias do Habbo</h2>
            <div className="space-y-4">
              <article className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-habbo-green mb-2">Novo Evento Especial Chegando!</h3>
                <p className="text-gray-600 mb-2">Prepare-se para o maior evento do ano no Habbo Hotel...</p>
                <span className="text-sm text-gray-500">Publicado em 27 de Janeiro, 2025</span>
              </article>
              
              <article className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-habbo-green mb-2">Novos Móveis no Catálogo</h3>
                <p className="text-gray-600 mb-2">Confira os novos móveis que chegaram ao catálogo esta semana...</p>
                <span className="text-sm text-gray-500">Publicado em 25 de Janeiro, 2025</span>
              </article>
              
              <article className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-habbo-green mb-2">Atualização de Segurança</h3>
                <p className="text-gray-600 mb-2">Implementamos novas medidas de segurança para proteger sua conta...</p>
                <span className="text-sm text-gray-500">Publicado em 22 de Janeiro, 2025</span>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Noticias;