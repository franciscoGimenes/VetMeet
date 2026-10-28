-- VetMeet: dados de catálogo (são dados de produção, não demo).
-- Slugs são usados na query string da busca e não devem mudar.

insert into public.regions (slug, nome, tipo, regiao_macro) values
  -- Alto Tietê
  ('aruja',                'Arujá',                'municipio', 'alto_tiete'),
  ('biritiba-mirim',       'Biritiba Mirim',       'municipio', 'alto_tiete'),
  ('ferraz-de-vasconcelos','Ferraz de Vasconcelos','municipio', 'alto_tiete'),
  ('guararema',            'Guararema',            'municipio', 'alto_tiete'),
  ('itaquaquecetuba',      'Itaquaquecetuba',      'municipio', 'alto_tiete'),
  ('mogi-das-cruzes',      'Mogi das Cruzes',      'municipio', 'alto_tiete'),
  ('poa',                  'Poá',                  'municipio', 'alto_tiete'),
  ('salesopolis',          'Salesópolis',          'municipio', 'alto_tiete'),
  ('santa-isabel',         'Santa Isabel',         'municipio', 'alto_tiete'),
  ('suzano',               'Suzano',               'municipio', 'alto_tiete'),
  -- Zona Leste de São Paulo (subprefeituras)
  ('penha',                'Penha',                     'subprefeitura', 'zona_leste_sp'),
  ('ermelino-matarazzo',   'Ermelino Matarazzo',        'subprefeitura', 'zona_leste_sp'),
  ('sao-miguel-paulista',  'São Miguel Paulista',       'subprefeitura', 'zona_leste_sp'),
  ('itaim-paulista',       'Itaim Paulista',            'subprefeitura', 'zona_leste_sp'),
  ('guaianases',           'Guaianases',                'subprefeitura', 'zona_leste_sp'),
  ('cidade-tiradentes',    'Cidade Tiradentes',         'subprefeitura', 'zona_leste_sp'),
  ('itaquera',             'Itaquera',                  'subprefeitura', 'zona_leste_sp'),
  ('sao-mateus',           'São Mateus',                'subprefeitura', 'zona_leste_sp'),
  ('mooca',                'Mooca',                     'subprefeitura', 'zona_leste_sp'),
  ('aricanduva',           'Aricanduva/Formosa/Carrão', 'subprefeitura', 'zona_leste_sp'),
  ('vila-prudente',        'Vila Prudente',             'subprefeitura', 'zona_leste_sp'),
  ('sapopemba',            'Sapopemba',                 'subprefeitura', 'zona_leste_sp');

-- Bairros: só nomes confirmados. Na Zona Leste, usamos os distritos oficiais de
-- cada subprefeitura. No Alto Tietê, centros e distritos/bairros conhecidos.
insert into public.neighborhoods (region_id, slug, nome)
select r.id, n.slug, n.nome
from (values
  ('aruja',                 'centro',             'Centro'),
  ('aruja',                 'arujazinho',         'Arujazinho'),
  ('biritiba-mirim',        'centro',             'Centro'),
  ('ferraz-de-vasconcelos', 'centro',             'Centro'),
  ('ferraz-de-vasconcelos', 'vila-romanopolis',   'Vila Romanópolis'),
  ('guararema',             'centro',             'Centro'),
  ('guararema',             'luiz-carlos',        'Luiz Carlos'),
  ('itaquaquecetuba',       'centro',             'Centro'),
  ('itaquaquecetuba',       'vila-virginia',      'Vila Virgínia'),
  ('mogi-das-cruzes',       'centro',             'Centro'),
  ('mogi-das-cruzes',       'vila-oliveira',      'Vila Oliveira'),
  ('mogi-das-cruzes',       'mogilar',            'Mogilar'),
  ('mogi-das-cruzes',       'alto-do-ipiranga',   'Alto do Ipiranga'),
  ('mogi-das-cruzes',       'bras-cubas',         'Brás Cubas'),
  ('mogi-das-cruzes',       'cesar-de-souza',     'César de Souza'),
  ('mogi-das-cruzes',       'jundiapeba',         'Jundiapeba'),
  ('mogi-das-cruzes',       'sabauna',            'Sabaúna'),
  ('mogi-das-cruzes',       'taiacupeba',         'Taiaçupeba'),
  ('mogi-das-cruzes',       'biritiba-ussu',      'Biritiba Ussu'),
  ('poa',                   'centro',             'Centro'),
  ('poa',                   'calmon-viana',       'Calmon Viana'),
  ('salesopolis',           'centro',             'Centro'),
  ('santa-isabel',          'centro',             'Centro'),
  ('suzano',                'centro',             'Centro'),
  ('suzano',                'palmeiras',          'Palmeiras'),
  ('suzano',                'vila-amorim',        'Vila Amorim'),
  ('penha',                 'penha',              'Penha'),
  ('penha',                 'vila-matilde',       'Vila Matilde'),
  ('penha',                 'cangaiba',           'Cangaíba'),
  ('penha',                 'artur-alvim',        'Artur Alvim'),
  ('ermelino-matarazzo',    'ermelino-matarazzo', 'Ermelino Matarazzo'),
  ('ermelino-matarazzo',    'ponte-rasa',         'Ponte Rasa'),
  ('sao-miguel-paulista',   'sao-miguel',         'São Miguel'),
  ('sao-miguel-paulista',   'jardim-helena',      'Jardim Helena'),
  ('sao-miguel-paulista',   'vila-jacui',         'Vila Jacuí'),
  ('itaim-paulista',        'itaim-paulista',     'Itaim Paulista'),
  ('itaim-paulista',        'vila-curuca',        'Vila Curuçá'),
  ('guaianases',            'guaianases',         'Guaianases'),
  ('guaianases',            'lajeado',            'Lajeado'),
  ('cidade-tiradentes',     'cidade-tiradentes',  'Cidade Tiradentes'),
  ('itaquera',              'itaquera',           'Itaquera'),
  ('itaquera',              'cidade-lider',       'Cidade Líder'),
  ('itaquera',              'jose-bonifacio',     'José Bonifácio'),
  ('itaquera',              'parque-do-carmo',    'Parque do Carmo'),
  ('sao-mateus',            'sao-mateus',         'São Mateus'),
  ('sao-mateus',            'sao-rafael',         'São Rafael'),
  ('sao-mateus',            'iguatemi',           'Iguatemi'),
  ('mooca',                 'mooca',              'Mooca'),
  ('mooca',                 'tatuape',            'Tatuapé'),
  ('mooca',                 'belem',              'Belém'),
  ('mooca',                 'agua-rasa',          'Água Rasa'),
  ('mooca',                 'bras',               'Brás'),
  ('mooca',                 'pari',               'Pari'),
  ('aricanduva',            'aricanduva',         'Aricanduva'),
  ('aricanduva',            'carrao',             'Carrão'),
  ('aricanduva',            'vila-formosa',       'Vila Formosa'),
  ('vila-prudente',         'vila-prudente',      'Vila Prudente'),
  ('vila-prudente',         'sao-lucas',          'São Lucas'),
  ('sapopemba',             'sapopemba',          'Sapopemba')
) as n(region_slug, slug, nome)
join public.regions r on r.slug = n.region_slug;

insert into public.species (slug, nome, ordem) values
  ('caes',       'Cães',                                     1),
  ('gatos',      'Gatos',                                    2),
  ('aves',       'Aves',                                     3),
  ('exoticos',   'Pets exóticos (roedores, coelhos, répteis)', 4),
  ('equinos',    'Equinos',                                  5),
  ('ruminantes', 'Ruminantes',                               6),
  ('suinos',     'Suínos',                                   7);

insert into public.specialties (slug, nome, ordem) values
  ('clinica-geral',          'Clínica geral',                             1),
  ('medicina-felina',        'Medicina felina',                           2),
  ('dermatologia',           'Dermatologia',                              3),
  ('cardiologia',            'Cardiologia',                               4),
  ('ortopedia',              'Ortopedia',                                 5),
  ('oftalmologia',           'Oftalmologia',                              6),
  ('odontologia',            'Odontologia',                               7),
  ('oncologia',              'Oncologia',                                 8),
  ('endocrinologia',         'Endocrinologia',                            9),
  ('neurologia',             'Neurologia',                               10),
  ('comportamento',          'Comportamento',                            11),
  ('nutricao',               'Nutrição',                                 12),
  ('fisioterapia',           'Fisioterapia e reabilitação',              13),
  ('acupuntura',             'Acupuntura',                               14),
  ('anestesiologia',         'Anestesiologia',                           15),
  ('diagnostico-por-imagem', 'Diagnóstico por imagem',                   16),
  ('silvestres-exoticos',    'Medicina de animais selvagens e exóticos', 17);

insert into public.services (slug, nome, ordem) values
  ('consulta',             'Consulta',                          1),
  ('vacinacao',            'Vacinação',                         2),
  ('castracao-cao',        'Castração (cão)',                   3),
  ('castracao-gato',       'Castração (gato)',                  4),
  ('aplicacao-medicacao',  'Aplicação de medicação',            5),
  ('coleta-exames',        'Coleta de exames',                  6),
  ('curativos',            'Curativos e retirada de pontos',    7),
  ('microchipagem',        'Microchipagem',                     8),
  ('atestado-viagem',      'Atestado de saúde para viagem',     9),
  ('ultrassonografia',     'Ultrassonografia',                 10),
  ('eutanasia',            'Eutanásia',                        11);

insert into public.attendance_modes (slug, nome, ordem) values
  ('clinica_propria', 'Clínica própria', 1),
  ('domiciliar',      'Domiciliar',      2),
  ('teleorientacao',  'Teleorientação',  3);

insert into public.payment_methods (slug, nome, ordem) values
  ('pix',          'Pix',               1),
  ('debito',       'Cartão de débito',  2),
  ('credito',      'Cartão de crédito', 3),
  ('parcelamento', 'Parcelamento',      4),
  ('dinheiro',     'Dinheiro',          5);
