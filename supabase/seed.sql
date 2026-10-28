-- =============================================================================
-- VetMeet: seed de DEMONSTRAÇÃO
--
-- Todos os perfis abaixo são fictícios (is_demo = true, crmv_verificado = false).
-- Nomes, CRMVs, bios, clínicas e endereços foram inventados.
--
-- ATENÇÃO: os números de WhatsApp dos demos são FICTÍCIOS (prefixo 551190000)
-- e NUNCA devem ser usados para abrir conversa. A UI bloqueia o link wa.me
-- para perfis demo. Instagram e foto ficam nulos para não apontar para contas
-- de pessoas reais.
--
-- O seed é reexecutável: começa removendo os demos existentes.
-- Para remover os demos sem recriar: supabase/scripts/remove_demo.sql
-- =============================================================================

begin;

delete from public.veterinarians where is_demo;

-- -----------------------------------------------------------------------------
-- Perfis
-- -----------------------------------------------------------------------------
insert into public.veterinarians (
  slug, nome_exibicao, crmv_numero, crmv_uf, crmv_verificado, whatsapp,
  anos_experiencia, consulta_preco_min, consulta_preco_max,
  atende_emergencia, atende_fim_de_semana, atende_noturno,
  status, is_demo, bio
)
select
  v.slug, v.nome, v.crmv, 'SP', false, '551190000' || right(v.crmv, 4),
  v.anos, v.pmin, v.pmax, v.emerg, v.fds, v.noturno,
  v.status::public.vet_status, true, v.bio
from (values
  -- Mogi das Cruzes ----------------------------------------------------------
  ('dra-camila-yamashita', 'Dra. Camila Yamashita', '98112', 9, 165, 290, false, true, false, 'ativo',
   'Atendo cães e gatos há quase dez anos em Mogi. Gosto de consulta sem pressa: explico o que estou vendo, o que precisa ser feito agora e o que pode esperar. Quando o pet não pode sair de casa, eu vou até ele.'),
  ('dr-rafael-montanari', 'Dr. Rafael Montanari', '98127', 14, 210, 260, true, false, false, 'ativo',
   'Ortopedista. Cuido de fraturas, luxação de patela e ruptura de ligamento cruzado, do diagnóstico ao pós-operatório. Também faço consulta de rotina para quem já é paciente da casa.'),
  ('dra-leticia-furukawa', 'Dra. Letícia Furukawa', '98135', 4, 220, 310, false, true, false, 'ativo',
   'Só atendo gatos, e só em casa. Gato estressado no transporte esconde sintoma e chega no consultório outro animal. Levo balança, material de coleta e muita paciência.'),
  ('dr-jose-arimateia-santos', 'Dr. José Arimatéia dos Santos', '98141', 22, 240, 380, true, true, true, 'ativo',
   'Veterinário de campo desde 2004. Atendo cavalo, gado de leite e porco nas propriedades de Taiaçupeba, Biritiba Ussu, Guararema e Salesópolis. Deslocamento combinado por telefone; parto e cólica a qualquer hora.'),
  ('dra-beatriz-okuma', 'Dra. Beatriz Okuma', '98156', 7, 180, 240, false, true, false, 'ativo',
   'Calopsitas, papagaios, coelhos, porquinhos-da-índia, hamsters, jabutis e lagartos. Muito problema de exótico vem de manejo, então a primeira consulta inclui uma conversa longa sobre alimentação, recinto e iluminação.'),
  ('dr-thiago-brandao', 'Dr. Thiago Brandão', '98163', 2, 180, 220, false, true, true, 'ativo',
   'Formado em 2024, atendo em domicílio de segunda a sábado, inclusive à noite. Vacinas, consultas de rotina, coleta de sangue e aplicação de medicação para quem não quer ou não consegue sair de casa com o pet.'),
  ('dra-mariana-salles', 'Dra. Mariana Salles', '98178', 11, 230, 260, false, false, false, 'ativo',
   'Dermatologia de cães e gatos: alergias, otites que voltam, queda de pelo, coceira que não passa. Traga o histórico, os exames anteriores e a lista do que já foi usado. Economiza tempo e dinheiro.'),
  ('dr-henrique-tavares', 'Dr. Henrique Tavares', '98184', 17, 145, 280, true, true, true, 'ativo',
   'Clínica pequena em César de Souza com plantão por telefone a noite toda. A gente conhece o bairro e boa parte dos pacientes desde filhote.'),
  ('dra-gabriela-nunes', 'Dra. Gabriela Nunes', '98199', 6, 190, 280, false, true, false, 'ativo',
   'Fisioterapia e acupuntura para cães idosos, pós-operatório de coluna e joelho e displasia. Sessões em casa, com plano de exercícios para o tutor continuar entre uma visita e outra.'),
  ('dra-patricia-oshiro', 'Dra. Patrícia Oshiro', '98203', 12, 140, 175, false, false, false, 'inativo',
   'Clínica geral para cães e gatos em Jundiapeba. Consultas, vacinas e pequenos procedimentos.'),
  ('dr-vinicius-carneiro', 'Dr. Vinícius Carneiro', '98219', 3, 130, 190, false, true, false, 'ativo',
   'Abri o consultório em Jundiapeba porque o bairro precisava. Preço justo, atendimento de perto e retorno sem custo em até 15 dias.'),

  -- Suzano -------------------------------------------------------------------
  ('dra-aline-kobayashi', 'Dra. Aline Kobayashi', '98224', 13, 240, 260, false, false, false, 'ativo',
   'Cardiologia veterinária com ecocardiograma e eletrocardiograma no consultório. Recebo também encaminhamentos de colegas da região e envio o laudo no mesmo dia.'),
  ('dr-marcos-vinicius-prado', 'Dr. Marcos Vinícius Prado', '98231', 9, 140, 175, false, true, false, 'ativo',
   'Clínica de bairro em Suzano, do jeito antigo: a gente atende, explica e liga no dia seguinte para saber como o bicho passou a noite.'),
  ('dra-fernanda-matsumoto', 'Dra. Fernanda Matsumoto', '98247', 5, 195, 260, false, true, false, 'ativo',
   'Consultas em casa em Suzano, Poá, Ferraz e Mogi. Faço também acompanhamento nutricional para cães acima do peso e gatos com doença renal, com dieta caseira balanceada.'),
  ('dra-renata-cunha', 'Dra. Renata Cunha', '98252', 12, 250, 260, false, false, false, 'ativo',
   'Oncologia de cães e gatos: diagnóstico, quimioterapia e cuidados paliativos. A conversa sobre prognóstico é franca, mas sempre sai com um plano, inclusive quando o plano é conforto.'),
  ('dr-paulo-hideki-sato', 'Dr. Paulo Hideki Sato', '98266', 27, 135, 170, true, false, false, 'ativo',
   'Clínico há mais de 25 anos em Palmeiras. Tenho ultrassom no consultório, o que adianta muito o diagnóstico de quem chega passando mal.'),
  ('dra-juliana-reis', 'Dra. Juliana Reis', '98270', 8, 260, 380, false, true, false, 'ativo',
   'Comportamento de cães e gatos: medo, agressividade, ansiedade de separação, xixi fora do lugar. A primeira consulta dura cerca de duas horas e acontece na casa de vocês, que é onde o problema aparece.'),
  ('dr-lucas-andrade', 'Dr. Lucas Andrade', '98285', 1, 180, 205, false, true, true, 'ativo',
   'Recém-formado, atendo em domicílio à noite e aos fins de semana, horário que costuma ficar descoberto. Medicação, curativo, vacina e consulta de rotina.'),
  ('dra-sabrina-moura', 'Dra. Sabrina Moura', '98291', 6, 190, 230, false, false, false, 'rascunho',
   'Odontologia veterinária. Perfil em construção.'),

  -- Itaquaquecetuba ----------------------------------------------------------
  ('dra-adriana-ferreira-lima', 'Dra. Adriana Ferreira Lima', '98306', 10, 130, 160, false, true, false, 'ativo',
   'Atendo em Itaquá há dez anos. Castração com preço acessível e mutirão de vacina duas vezes por ano, sempre divulgado no consultório.'),
  ('dr-wesley-batista', 'Dr. Wesley Batista', '98312', 3, 180, 230, false, false, false, 'ativo',
   'Moro em Itaquá e atendo a domicílio na cidade e arredores. Recebo muitos pets idosos que já não aguentam o transporte e faço eutanásia em casa, com calma, quando chega a hora.'),
  ('dra-ingrid-rocha', 'Dra. Ingrid Rocha', '98329', 7, 150, 190, false, false, false, 'ativo',
   'Consultório só para gatos, sem latido na sala de espera. Manejo com pouca contenção e horários espaçados para ninguém esperar.'),

  -- Arujá --------------------------------------------------------------------
  ('dr-fabio-guimaraes', 'Dr. Fábio Guimarães', '98333', 19, 175, 240, false, false, false, 'ativo',
   'Clínica geral e endocrinologia: diabetes, hipotireoidismo e Cushing. Paciente endócrino precisa de acompanhamento de perto, então monto a rotina de exames junto com o tutor.'),
  ('dra-nathalia-pereira', 'Dra. Nathália Pereira', '98348', 8, 280, 380, true, true, false, 'ativo',
   'Clínica de equinos e odontologia equina em haras e hípicas da região. Atendo cólica a qualquer hora e faço exame para transporte e competição.'),

  -- Poá ----------------------------------------------------------------------
  ('dra-carolina-mendes', 'Dra. Carolina Mendes', '98354', 6, 145, 250, false, false, false, 'ativo',
   'Clínica geral com olhar atento para pele e ouvido, que somam metade das queixas do dia a dia. Atendo no consultório em Poá e em casa quando o pet não pode sair.'),
  ('dr-rodrigo-albuquerque', 'Dr. Rodrigo Albuquerque', '98367', 11, 220, 255, false, false, false, 'ativo',
   'Oftalmologia veterinária: catarata, glaucoma, úlcera de córnea e olho seco. A consulta inclui tonometria e teste lacrimal. Cirurgia de catarata com agendamento.'),

  -- Ferraz de Vasconcelos ----------------------------------------------------
  ('dra-tatiane-gomes', 'Dra. Tatiane Gomes', '98371', 4, 130, 150, false, true, false, 'ativo',
   'Consultório simples e bem equipado em Ferraz. De manhã atendo por ordem de chegada; à tarde, com hora marcada.'),
  ('dr-diego-farias', 'Dr. Diego Farias', '98386', 5, 190, 240, false, true, false, 'ativo',
   'Atendimento em casa em Ferraz, Poá e no extremo leste de São Paulo, em Guaianases e Cidade Tiradentes. Atendo coelhos também.'),

  -- Santa Isabel -------------------------------------------------------------
  ('dra-luciana-bastos', 'Dra. Luciana Bastos', '98392', 16, 140, 260, true, true, false, 'ativo',
   'Clínica de cidade pequena atende de tudo: cachorro, gato, cavalo e a vaca do sítio do vizinho. Consultório no centro de Santa Isabel e visitas nas chácaras da região.'),

  -- Guararema ----------------------------------------------------------------
  ('dr-marcelo-teixeira', 'Dr. Marcelo Teixeira', '98408', 12, 220, 350, true, true, false, 'ativo',
   'Atendo bovinos de leite e corte, ovinos, caprinos e suínos em Guararema e região. Manejo sanitário, diagnóstico de gestação por ultrassom e planejamento nutricional do rebanho.'),
  ('dra-isabela-correa', 'Dra. Isabela Corrêa', '98413', 5, 150, 240, false, true, false, 'ativo',
   'Consultório pequeno no centro de Guararema e atendimento em casa até Luiz Carlos e Sabaúna. Muita gente aqui tem bicho de sítio e de casa ao mesmo tempo; eu cuido dos de casa.'),

  -- Salesópolis --------------------------------------------------------------
  ('dr-antonio-carlos-ribeiro', 'Dr. Antônio Carlos Ribeiro', '98429', 31, 130, 240, true, true, true, 'ativo',
   'Mais de trinta anos em Salesópolis. Atendo no consultório de manhã e à tarde saio para as propriedades. Se for urgência, pode ligar que eu vou.'),

  -- Biritiba Mirim -----------------------------------------------------------
  ('dra-elaine-santiago', 'Dra. Elaine Santiago', '98434', 3, 180, 220, false, true, false, 'ativo',
   'Atendo cães e gatos em casa em Biritiba Mirim e Salesópolis, onde quase não tem clínica aberta no fim de semana. Sábado e domingo com agendamento.'),

  -- Itaquera -----------------------------------------------------------------
  ('dra-priscila-nascimento', 'Dra. Priscila Nascimento', '98447', 8, 140, 170, true, true, false, 'ativo',
   'Clínica geral em Itaquera, perto do metrô. Castração com anestesia inalatória e monitoração; o pet volta para casa no mesmo dia.'),
  ('dr-anderson-cruz', 'Dr. Anderson Cruz', '98452', 6, 190, 230, false, false, true, 'ativo',
   'Domiciliar em Itaquera e redondezas, até Cidade Tiradentes. Vou de moto, então chego rápido, e aviso no WhatsApp quando estiver saindo.'),
  ('dra-yasmin-oliveira', 'Dra. Yasmin Oliveira', '98468', 4, 170, 210, false, true, false, 'ativo',
   'Pós-graduada em animais selvagens e exóticos. Coelho que parou de comer é urgência: se for o caso, me chama que eu encaixo no mesmo dia.'),

  -- São Mateus ---------------------------------------------------------------
  ('dr-claudio-hirata', 'Dr. Cláudio Hirata', '98473', 20, 135, 165, false, false, false, 'ativo',
   'Clínico e dentista veterinário. Tártaro e dente quebrado doem muito mais do que parece. Faço limpeza e extração com anestesia geral e radiografia odontológica.'),
  ('dra-michele-araujo', 'Dra. Michele Araújo', '98489', 2, 180, 210, false, true, false, 'ativo',
   'Comecei atendendo os bichos da vizinhança em São Mateus e hoje faço domicílio em toda a região. Atendo sábado, e domingo quando é preciso.'),
  ('dr-gilberto-lacerda', 'Dr. Gilberto Lacerda', '98494', 25, 150, 210, true, true, true, 'ativo',
   'Hospital veterinário 24 horas no Iguatemi. Plantonista todos os dias, inclusive feriados, com internação e exames na mesma estrutura.'),

  -- Penha --------------------------------------------------------------------
  ('dra-vanessa-lopes', 'Dra. Vanessa Lopes', '98502', 9, 160, 195, false, false, false, 'ativo',
   'Atendo cães e gatos, com carinho especial pelos felinos (tenho quatro em casa). Na Penha, terças e quintas à tarde são reservadas só para gatos.'),
  ('dr-guilherme-pacheco', 'Dr. Guilherme Pacheco', '98517', 7, 150, 280, false, true, false, 'ativo',
   'Vai viajar com o pet para fora do país? Faço o atestado de saúde e o microchip e oriento sobre sorologia e prazos. No dia a dia, clínica geral na Vila Matilde e em domicílio.'),
  ('dra-carla-menezes', 'Dra. Carla Menezes', '98523', 15, 210, 300, false, false, false, 'ativo',
   'Acupuntura e fisioterapia para dor crônica, hérnia de disco e pets idosos. Atendo em casa e faço retornos de orientação por vídeo.'),

  -- Mooca --------------------------------------------------------------------
  ('dra-roberta-campos', 'Dra. Roberta Campos', '98538', 13, 250, 260, false, false, false, 'ativo',
   'Neurologia de cães e gatos: convulsões, hérnia de disco, andar cambaleante, cabeça inclinada. Faço exame neurológico completo e, se precisar, indico ressonância e acompanho o resultado.'),
  ('dr-felipe-amaral', 'Dr. Felipe Amaral', '98544', 10, null, null, false, true, false, 'ativo',
   'Ultrassonografia abdominal, gestacional e cervical. No consultório da Mooca ou na casa do paciente com aparelho portátil. Laudo enviado em até 24 horas.'),
  ('dra-livia-cardoso', 'Dra. Lívia Cardoso', '98559', 6, 190, 260, false, false, false, 'ativo',
   'Nutrição clínica por videochamada: dieta caseira formulada, troca de ração, obesidade, doença renal e alergia alimentar. Envio o cardápio calculado em até cinco dias úteis.'),
  ('dr-ricardo-belmonte', 'Dr. Ricardo Belmonte', '98565', 18, 190, 240, true, true, false, 'ativo',
   'Clínica no Belém com cardiologia e exames de imagem. Faço avaliação pré-anestésica para castração e cirurgias em pets idosos.'),

  -- Aricanduva/Formosa/Carrão ------------------------------------------------
  ('dra-debora-figueiredo', 'Dra. Débora Figueiredo', '98571', 12, 155, 185, false, true, false, 'ativo',
   'Consultório na Vila Formosa há doze anos. Protocolo de vacina individualizado e lembrete de reforço pelo WhatsApp.'),
  ('dr-otavio-rangel', 'Dr. Otávio Rangel', '98586', 23, 150, 180, false, false, false, 'inativo',
   'Clínica geral de cães e gatos no Carrão.'),

  -- Vila Prudente ------------------------------------------------------------
  ('dra-simone-azevedo', 'Dra. Simone Azevedo', '98592', 21, 165, 215, false, false, false, 'ativo',
   'Clínica geral e dermatologia na Vila Prudente. Atendo muitos buldogues e shih-tzus, raças que pedem cuidado redobrado com pele, olhos e respiração.'),

  -- Sapopemba ----------------------------------------------------------------
  ('dr-kleber-moreira', 'Dr. Kléber Moreira', '98605', 4, 130, 190, false, true, false, 'ativo',
   'Atendimento acessível em Sapopemba, no consultório ou em casa. Converso sobre forma de pagamento da castração para quem precisa.'),

  -- São Miguel Paulista ------------------------------------------------------
  ('dra-rosana-barbosa', 'Dra. Rosana Barbosa', '98611', 14, 135, 160, true, true, false, 'ativo',
   'Clínica veterinária em São Miguel Paulista. Protetores independentes têm valor diferenciado para castração.'),

  -- Ermelino Matarazzo -------------------------------------------------------
  ('dr-samuel-matos', 'Dr. Samuel Matos', '98626', 5, 185, 240, false, false, true, 'ativo',
   'Atendimento em casa na região de Ermelino e São Miguel, inclusive à noite. Também atendo calopsitas e periquitos em consultas de rotina.'),

  -- Itaim Paulista -----------------------------------------------------------
  ('dra-jessica-valente', 'Dra. Jéssica Valente', '98632', 3, 130, 145, false, false, false, 'ativo',
   'Consultório na Vila Curuçá com foco em prevenção: vacina, vermífugo, controle de pulga e carrapato e check-up anual.'),

  -- Guaianases ---------------------------------------------------------------
  ('dr-renan-castro', 'Dr. Renan Castro', '98647', 9, 135, 210, true, false, true, 'ativo',
   'Atendo em Guaianases e faço visitas em Cidade Tiradentes. Pacientes da clínica têm plantão noturno por telefone.')
) as v(slug, nome, crmv, anos, pmin, pmax, emerg, fds, noturno, status, bio);

-- -----------------------------------------------------------------------------
-- Vínculos (espécies, áreas, modalidades, cobertura domiciliar, pagamentos e
-- serviços com preço). servicos: {"slug": [preco_min, preco_max]}
-- -----------------------------------------------------------------------------
create temp table demo_perfil (
  slug text primary key,
  especies text[] not null,
  areas text[] not null,
  principal text not null,
  modos text[] not null,
  cobertura text[] not null,
  pagamentos text[] not null,
  parcelas smallint,
  servicos jsonb not null
) on commit drop;

insert into demo_perfil values
  -- Mogi das Cruzes
  ('dra-camila-yamashita', '{caes,gatos}', '{clinica-geral,medicina-felina}', 'clinica-geral',
   '{clinica_propria,domiciliar}', '{mogi-das-cruzes,suzano}', '{pix,debito,credito,parcelamento}', 3,
   '{"consulta":[165,290],"vacinacao":[95,140],"castracao-gato":[480,620],"castracao-cao":[690,1350],"aplicacao-medicacao":[40,70],"coleta-exames":[60,90],"curativos":[55,90],"microchipagem":[120,120],"atestado-viagem":[180,220]}'),
  ('dr-rafael-montanari', '{caes,gatos}', '{ortopedia,clinica-geral}', 'ortopedia',
   '{clinica_propria}', '{}', '{pix,debito,credito,parcelamento}', 6,
   '{"consulta":[210,260],"castracao-cao":[850,1400],"castracao-gato":[520,750],"coleta-exames":[70,110],"curativos":[60,95]}'),
  ('dra-leticia-furukawa', '{gatos}', '{medicina-felina}', 'medicina-felina',
   '{domiciliar}', '{mogi-das-cruzes,suzano,biritiba-mirim}', '{pix,credito}', null,
   '{"consulta":[220,310],"vacinacao":[110,150],"aplicacao-medicacao":[60,90],"coleta-exames":[90,130],"curativos":[70,110],"eutanasia":[450,650]}'),
  ('dr-jose-arimateia-santos', '{equinos,ruminantes,suinos}', '{clinica-geral}', 'clinica-geral',
   '{domiciliar}', '{mogi-das-cruzes,guararema,salesopolis,biritiba-mirim}', '{pix,dinheiro}', null,
   '{"consulta":[240,380],"vacinacao":[35,60],"coleta-exames":[80,150],"aplicacao-medicacao":[45,80],"curativos":[90,180],"ultrassonografia":[180,260],"atestado-viagem":[150,240],"eutanasia":[600,900]}'),
  ('dra-beatriz-okuma', '{aves,exoticos}', '{silvestres-exoticos}', 'silvestres-exoticos',
   '{clinica_propria,teleorientacao}', '{}', '{pix,debito,credito}', null,
   '{"consulta":[180,240],"coleta-exames":[90,140],"aplicacao-medicacao":[50,80],"curativos":[60,120],"microchipagem":[130,150],"eutanasia":[280,420]}'),
  ('dr-thiago-brandao', '{caes,gatos}', '{clinica-geral}', 'clinica-geral',
   '{domiciliar}', '{mogi-das-cruzes,suzano}', '{pix,debito,credito}', null,
   '{"consulta":[180,220],"vacinacao":[85,120],"aplicacao-medicacao":[35,60],"coleta-exames":[55,80],"curativos":[45,70],"microchipagem":[110,110]}'),
  ('dra-mariana-salles', '{caes,gatos}', '{dermatologia,clinica-geral}', 'dermatologia',
   '{clinica_propria}', '{}', '{pix,debito,credito,parcelamento}', 3,
   '{"consulta":[230,260],"coleta-exames":[70,120]}'),
  ('dr-henrique-tavares', '{caes,gatos}', '{clinica-geral,diagnostico-por-imagem}', 'clinica-geral',
   '{clinica_propria,domiciliar}', '{mogi-das-cruzes}', '{pix,debito,credito,parcelamento,dinheiro}', 10,
   '{"consulta":[145,280],"vacinacao":[90,135],"castracao-cao":[640,1250],"castracao-gato":[420,560],"aplicacao-medicacao":[30,55],"coleta-exames":[55,85],"curativos":[45,80],"microchipagem":[115,115],"atestado-viagem":[160,200],"ultrassonografia":[160,210],"eutanasia":[380,560]}'),
  ('dra-gabriela-nunes', '{caes,gatos}', '{fisioterapia,acupuntura}', 'fisioterapia',
   '{domiciliar,teleorientacao}', '{mogi-das-cruzes,suzano}', '{pix,credito,parcelamento}', 4,
   '{"consulta":[190,280]}'),
  ('dra-patricia-oshiro', '{caes,gatos}', '{clinica-geral}', 'clinica-geral',
   '{clinica_propria}', '{}', '{pix,debito,credito}', null,
   '{"consulta":[140,175],"vacinacao":[80,115]}'),
  ('dr-vinicius-carneiro', '{caes,gatos}', '{clinica-geral}', 'clinica-geral',
   '{clinica_propria,domiciliar}', '{mogi-das-cruzes}', '{pix,debito,credito,dinheiro}', null,
   '{"consulta":[130,190],"vacinacao":[75,110],"castracao-gato":[380,450],"castracao-cao":[590,980],"aplicacao-medicacao":[30,45],"curativos":[40,65],"microchipagem":[95,95]}'),

  -- Suzano
  ('dra-aline-kobayashi', '{caes,gatos}', '{cardiologia}', 'cardiologia',
   '{clinica_propria,teleorientacao}', '{}', '{pix,debito,credito,parcelamento}', 5,
   '{"consulta":[240,260],"ultrassonografia":[280,360],"coleta-exames":[70,110]}'),
  ('dr-marcos-vinicius-prado', '{caes,gatos}', '{clinica-geral}', 'clinica-geral',
   '{clinica_propria}', '{}', '{pix,debito,credito,parcelamento,dinheiro}', 6,
   '{"consulta":[140,175],"vacinacao":[85,125],"castracao-cao":[620,1180],"castracao-gato":[400,520],"aplicacao-medicacao":[30,50],"coleta-exames":[55,80],"curativos":[40,70],"microchipagem":[110,110],"atestado-viagem":[150,190]}'),
  ('dra-fernanda-matsumoto', '{caes,gatos}', '{clinica-geral,nutricao}', 'clinica-geral',
   '{domiciliar}', '{suzano,poa,ferraz-de-vasconcelos,mogi-das-cruzes}', '{pix,credito}', null,
   '{"consulta":[195,260],"vacinacao":[100,140],"aplicacao-medicacao":[45,70],"coleta-exames":[70,95],"curativos":[55,85],"microchipagem":[125,125]}'),
  ('dra-renata-cunha', '{caes,gatos}', '{oncologia}', 'oncologia',
   '{clinica_propria,teleorientacao}', '{}', '{pix,debito,credito,parcelamento}', 10,
   '{"consulta":[250,260],"aplicacao-medicacao":[180,420],"coleta-exames":[80,130]}'),
  ('dr-paulo-hideki-sato', '{caes,gatos}', '{clinica-geral,diagnostico-por-imagem}', 'clinica-geral',
   '{clinica_propria}', '{}', '{pix,debito,credito,dinheiro}', null,
   '{"consulta":[135,170],"vacinacao":[80,115],"castracao-cao":[560,1100],"castracao-gato":[380,470],"ultrassonografia":[140,190],"coleta-exames":[50,80],"curativos":[40,65],"eutanasia":[350,500]}'),
  ('dra-juliana-reis', '{caes,gatos}', '{comportamento}', 'comportamento',
   '{domiciliar,teleorientacao}', '{suzano,mogi-das-cruzes,poa,itaquaquecetuba,aruja}', '{pix,credito,parcelamento}', 3,
   '{"consulta":[260,380]}'),
  ('dr-lucas-andrade', '{caes,gatos}', '{clinica-geral}', 'clinica-geral',
   '{domiciliar}', '{suzano,ferraz-de-vasconcelos,poa,itaquaquecetuba}', '{pix,debito,dinheiro}', null,
   '{"consulta":[180,205],"vacinacao":[80,110],"aplicacao-medicacao":[35,50],"curativos":[40,60],"coleta-exames":[50,75]}'),
  ('dra-sabrina-moura', '{caes,gatos}', '{odontologia}', 'odontologia',
   '{clinica_propria}', '{}', '{pix,credito}', null,
   '{"consulta":[190,230]}'),

  -- Itaquaquecetuba
  ('dra-adriana-ferreira-lima', '{caes,gatos}', '{clinica-geral}', 'clinica-geral',
   '{clinica_propria}', '{}', '{pix,debito,credito,parcelamento,dinheiro}', 4,
   '{"consulta":[130,160],"vacinacao":[70,105],"castracao-cao":[520,980],"castracao-gato":[380,440],"aplicacao-medicacao":[25,45],"curativos":[35,60],"microchipagem":[90,90],"coleta-exames":[50,75]}'),
  ('dr-wesley-batista', '{caes,gatos}', '{clinica-geral}', 'clinica-geral',
   '{domiciliar}', '{itaquaquecetuba,aruja,poa,ferraz-de-vasconcelos}', '{pix,debito,credito}', null,
   '{"consulta":[180,230],"vacinacao":[80,110],"aplicacao-medicacao":[35,55],"coleta-exames":[60,80],"curativos":[45,70],"eutanasia":[320,450]}'),
  ('dra-ingrid-rocha', '{gatos}', '{medicina-felina}', 'medicina-felina',
   '{clinica_propria}', '{}', '{pix,debito,credito,parcelamento}', 3,
   '{"consulta":[150,190],"vacinacao":[95,130],"castracao-gato":[420,520],"coleta-exames":[70,100],"aplicacao-medicacao":[35,55],"microchipagem":[100,100]}'),

  -- Arujá
  ('dr-fabio-guimaraes', '{caes,gatos}', '{clinica-geral,endocrinologia}', 'endocrinologia',
   '{clinica_propria}', '{}', '{pix,debito,credito,parcelamento}', 6,
   '{"consulta":[175,240],"vacinacao":[100,145],"castracao-cao":[780,1380],"castracao-gato":[490,640],"coleta-exames":[65,100],"aplicacao-medicacao":[40,60],"ultrassonografia":[170,220],"atestado-viagem":[190,240]}'),
  ('dra-nathalia-pereira', '{equinos}', '{clinica-geral,odontologia}', 'clinica-geral',
   '{domiciliar}', '{aruja,santa-isabel,mogi-das-cruzes,guararema}', '{pix,credito,dinheiro}', null,
   '{"consulta":[280,380],"vacinacao":[60,90],"coleta-exames":[90,150],"aplicacao-medicacao":[50,90],"curativos":[100,200],"ultrassonografia":[200,280],"atestado-viagem":[180,260]}'),

  -- Poá
  ('dra-carolina-mendes', '{caes,gatos}', '{clinica-geral,dermatologia}', 'clinica-geral',
   '{clinica_propria,domiciliar}', '{poa,ferraz-de-vasconcelos,suzano}', '{pix,debito,credito,parcelamento}', 3,
   '{"consulta":[145,250],"vacinacao":[85,120],"castracao-gato":[410,480],"aplicacao-medicacao":[30,50],"coleta-exames":[55,85],"curativos":[40,70],"microchipagem":[105,105]}'),
  ('dr-rodrigo-albuquerque', '{caes,gatos}', '{oftalmologia}', 'oftalmologia',
   '{clinica_propria}', '{}', '{pix,debito,credito,parcelamento}', 6,
   '{"consulta":[220,255]}'),

  -- Ferraz de Vasconcelos
  ('dra-tatiane-gomes', '{caes,gatos}', '{clinica-geral}', 'clinica-geral',
   '{clinica_propria}', '{}', '{pix,debito,credito,dinheiro}', null,
   '{"consulta":[130,150],"vacinacao":[70,100],"castracao-cao":[540,1020],"castracao-gato":[380,430],"aplicacao-medicacao":[25,40],"curativos":[35,55],"microchipagem":[89.90,89.90]}'),
  ('dr-diego-farias', '{caes,gatos,exoticos}', '{clinica-geral}', 'clinica-geral',
   '{domiciliar}', '{ferraz-de-vasconcelos,poa,suzano,guaianases,cidade-tiradentes}', '{pix,credito}', null,
   '{"consulta":[190,240],"vacinacao":[85,115],"aplicacao-medicacao":[40,60],"coleta-exames":[60,85],"curativos":[45,75],"microchipagem":[115,115]}'),

  -- Santa Isabel
  ('dra-luciana-bastos', '{caes,gatos,equinos,ruminantes}', '{clinica-geral}', 'clinica-geral',
   '{clinica_propria,domiciliar}', '{santa-isabel,aruja}', '{pix,debito,credito,dinheiro}', null,
   '{"consulta":[140,260],"vacinacao":[80,120],"castracao-cao":[600,1150],"castracao-gato":[400,490],"aplicacao-medicacao":[30,60],"coleta-exames":[55,90],"curativos":[40,90],"atestado-viagem":[160,210],"eutanasia":[400,650]}'),

  -- Guararema
  ('dr-marcelo-teixeira', '{ruminantes,suinos,equinos}', '{clinica-geral,nutricao}', 'clinica-geral',
   '{domiciliar}', '{guararema,mogi-das-cruzes,salesopolis,santa-isabel}', '{pix,debito,dinheiro}', null,
   '{"consulta":[220,350],"vacinacao":[25,45],"coleta-exames":[70,130],"aplicacao-medicacao":[40,70],"ultrassonografia":[150,230],"curativos":[80,160],"atestado-viagem":[140,220]}'),
  ('dra-isabela-correa', '{caes,gatos}', '{clinica-geral}', 'clinica-geral',
   '{clinica_propria,domiciliar}', '{guararema,mogi-das-cruzes}', '{pix,debito,credito,parcelamento}', 3,
   '{"consulta":[150,240],"vacinacao":[90,130],"castracao-gato":[430,520],"castracao-cao":[650,1200],"aplicacao-medicacao":[35,55],"curativos":[40,70],"microchipagem":[110,110],"atestado-viagem":[170,210]}'),

  -- Salesópolis
  ('dr-antonio-carlos-ribeiro', '{caes,gatos,equinos,ruminantes,suinos}', '{clinica-geral}', 'clinica-geral',
   '{clinica_propria,domiciliar}', '{salesopolis,biritiba-mirim}', '{pix,dinheiro}', null,
   '{"consulta":[130,240],"vacinacao":[60,100],"castracao-cao":[520,950],"castracao-gato":[380,420],"aplicacao-medicacao":[25,50],"coleta-exames":[50,90],"curativos":[35,80],"atestado-viagem":[140,190],"eutanasia":[300,600]}'),

  -- Biritiba Mirim
  ('dra-elaine-santiago', '{caes,gatos}', '{clinica-geral}', 'clinica-geral',
   '{domiciliar}', '{biritiba-mirim,salesopolis,mogi-das-cruzes}', '{pix,debito,credito}', null,
   '{"consulta":[180,220],"vacinacao":[85,115],"aplicacao-medicacao":[35,55],"curativos":[45,70],"coleta-exames":[60,85]}'),

  -- Itaquera
  ('dra-priscila-nascimento', '{caes,gatos}', '{clinica-geral}', 'clinica-geral',
   '{clinica_propria}', '{}', '{pix,debito,credito,parcelamento,dinheiro}', 4,
   '{"consulta":[140,170],"vacinacao":[80,115],"castracao-cao":[590,1150],"castracao-gato":[390,470],"aplicacao-medicacao":[30,45],"coleta-exames":[50,80],"curativos":[40,65],"microchipagem":[100,100]}'),
  ('dr-anderson-cruz', '{caes,gatos}', '{clinica-geral}', 'clinica-geral',
   '{domiciliar}', '{itaquera,guaianases,cidade-tiradentes,sao-mateus,itaim-paulista}', '{pix,debito,credito}', null,
   '{"consulta":[190,230],"vacinacao":[85,115],"aplicacao-medicacao":[35,55],"coleta-exames":[55,80],"curativos":[45,70],"eutanasia":[350,480]}'),
  ('dra-yasmin-oliveira', '{aves,exoticos}', '{silvestres-exoticos}', 'silvestres-exoticos',
   '{clinica_propria}', '{}', '{pix,debito,credito}', null,
   '{"consulta":[170,210],"coleta-exames":[80,120],"aplicacao-medicacao":[45,70],"curativos":[50,90],"microchipagem":[120,120]}'),

  -- São Mateus
  ('dr-claudio-hirata', '{caes,gatos}', '{clinica-geral,odontologia}', 'odontologia',
   '{clinica_propria}', '{}', '{pix,debito,credito,parcelamento,dinheiro}', 6,
   '{"consulta":[135,165],"vacinacao":[75,110],"castracao-cao":[560,1080],"castracao-gato":[380,450],"aplicacao-medicacao":[25,45],"curativos":[35,60],"coleta-exames":[50,75],"microchipagem":[95,95],"eutanasia":[320,480]}'),
  ('dra-michele-araujo', '{caes,gatos}', '{clinica-geral}', 'clinica-geral',
   '{domiciliar}', '{sao-mateus,sapopemba,itaquera,vila-prudente}', '{pix,debito}', null,
   '{"consulta":[180,210],"vacinacao":[80,110],"aplicacao-medicacao":[35,50],"coleta-exames":[55,75],"curativos":[40,60]}'),
  ('dr-gilberto-lacerda', '{caes,gatos}', '{clinica-geral,anestesiologia,diagnostico-por-imagem}', 'clinica-geral',
   '{clinica_propria}', '{}', '{pix,debito,credito,parcelamento,dinheiro}', 10,
   '{"consulta":[150,210],"vacinacao":[90,130],"castracao-cao":[680,1320],"castracao-gato":[440,590],"aplicacao-medicacao":[35,60],"coleta-exames":[60,95],"curativos":[45,85],"microchipagem":[120,120],"atestado-viagem":[170,220],"ultrassonografia":[170,230],"eutanasia":[420,620]}'),

  -- Penha
  ('dra-vanessa-lopes', '{gatos,caes}', '{medicina-felina,clinica-geral}', 'medicina-felina',
   '{clinica_propria}', '{}', '{pix,debito,credito,parcelamento}', 3,
   '{"consulta":[160,195],"vacinacao":[95,135],"castracao-gato":[450,560],"castracao-cao":[720,1290],"coleta-exames":[60,90],"aplicacao-medicacao":[35,55],"microchipagem":[115,115]}'),
  ('dr-guilherme-pacheco', '{caes,gatos}', '{clinica-geral}', 'clinica-geral',
   '{clinica_propria,domiciliar}', '{penha,ermelino-matarazzo,aricanduva,mooca}', '{pix,debito,credito,parcelamento}', 6,
   '{"consulta":[150,280],"vacinacao":[90,130],"castracao-cao":[680,1250],"castracao-gato":[430,540],"aplicacao-medicacao":[35,60],"coleta-exames":[55,90],"curativos":[45,75],"atestado-viagem":[190,250],"microchipagem":[130,130]}'),
  ('dra-carla-menezes', '{caes,gatos}', '{acupuntura,fisioterapia}', 'acupuntura',
   '{domiciliar,teleorientacao}', '{penha,mooca,aricanduva,vila-prudente}', '{pix,credito,parcelamento}', 4,
   '{"consulta":[210,300]}'),

  -- Mooca
  ('dra-roberta-campos', '{caes,gatos}', '{neurologia}', 'neurologia',
   '{clinica_propria}', '{}', '{pix,debito,credito,parcelamento}', 6,
   '{"consulta":[250,260],"coleta-exames":[90,140]}'),
  ('dr-felipe-amaral', '{caes,gatos}', '{diagnostico-por-imagem}', 'diagnostico-por-imagem',
   '{clinica_propria,domiciliar}', '{mooca,aricanduva,vila-prudente}', '{pix,debito,credito}', null,
   '{"ultrassonografia":[180,320]}'),
  ('dra-livia-cardoso', '{caes,gatos}', '{nutricao,endocrinologia}', 'nutricao',
   '{teleorientacao}', '{}', '{pix,credito,parcelamento}', 3,
   '{"consulta":[190,260]}'),
  ('dr-ricardo-belmonte', '{caes,gatos}', '{clinica-geral,cardiologia}', 'clinica-geral',
   '{clinica_propria}', '{}', '{pix,debito,credito,parcelamento}', 10,
   '{"consulta":[190,240],"vacinacao":[110,160],"castracao-cao":[850,1400],"castracao-gato":[520,750],"coleta-exames":[70,110],"ultrassonografia":[190,260],"atestado-viagem":[220,260],"microchipagem":[140,140],"eutanasia":[450,700]}'),

  -- Aricanduva/Formosa/Carrão
  ('dra-debora-figueiredo', '{caes,gatos}', '{clinica-geral}', 'clinica-geral',
   '{clinica_propria}', '{}', '{pix,debito,credito,parcelamento,dinheiro}', 5,
   '{"consulta":[155,185],"vacinacao":[90,125],"castracao-cao":[640,1190],"castracao-gato":[420,500],"aplicacao-medicacao":[30,50],"coleta-exames":[55,85],"curativos":[40,70],"microchipagem":[110,110]}'),
  ('dr-otavio-rangel', '{caes,gatos}', '{clinica-geral}', 'clinica-geral',
   '{clinica_propria}', '{}', '{pix,debito,credito}', null,
   '{"consulta":[150,180]}'),

  -- Vila Prudente
  ('dra-simone-azevedo', '{caes,gatos}', '{clinica-geral,dermatologia}', 'clinica-geral',
   '{clinica_propria}', '{}', '{pix,debito,credito,parcelamento}', 4,
   '{"consulta":[165,215],"vacinacao":[90,130],"castracao-cao":[690,1290],"castracao-gato":[440,530],"coleta-exames":[60,95],"curativos":[40,70],"aplicacao-medicacao":[30,50]}'),

  -- Sapopemba
  ('dr-kleber-moreira', '{caes,gatos}', '{clinica-geral}', 'clinica-geral',
   '{clinica_propria,domiciliar}', '{sapopemba,sao-mateus,vila-prudente}', '{pix,debito,credito,dinheiro}', null,
   '{"consulta":[130,190],"vacinacao":[70,100],"castracao-gato":[380,420],"castracao-cao":[520,960],"aplicacao-medicacao":[25,40],"curativos":[35,55],"microchipagem":[90,90]}'),

  -- São Miguel Paulista
  ('dra-rosana-barbosa', '{caes,gatos}', '{clinica-geral}', 'clinica-geral',
   '{clinica_propria}', '{}', '{pix,debito,credito,parcelamento,dinheiro}', 4,
   '{"consulta":[135,160],"vacinacao":[75,105],"castracao-cao":[540,1050],"castracao-gato":[380,440],"aplicacao-medicacao":[25,45],"coleta-exames":[50,75],"curativos":[35,60],"microchipagem":[95,95],"eutanasia":[300,450]}'),

  -- Ermelino Matarazzo
  ('dr-samuel-matos', '{caes,gatos,aves}', '{clinica-geral}', 'clinica-geral',
   '{domiciliar,teleorientacao}', '{ermelino-matarazzo,sao-miguel-paulista,itaim-paulista,penha}', '{pix,credito}', null,
   '{"consulta":[185,240],"vacinacao":[85,115],"aplicacao-medicacao":[40,60],"coleta-exames":[60,85],"curativos":[45,70],"microchipagem":[110,110]}'),

  -- Itaim Paulista
  ('dra-jessica-valente', '{caes,gatos}', '{clinica-geral}', 'clinica-geral',
   '{clinica_propria}', '{}', '{pix,debito,credito,dinheiro}', null,
   '{"consulta":[130,145],"vacinacao":[70,95],"castracao-gato":[380,410],"castracao-cao":[500,920],"aplicacao-medicacao":[25,40],"curativos":[35,55]}'),

  -- Guaianases
  ('dr-renan-castro', '{caes,gatos}', '{clinica-geral}', 'clinica-geral',
   '{clinica_propria,domiciliar}', '{guaianases,cidade-tiradentes,itaquera}', '{pix,debito,credito,dinheiro}', null,
   '{"consulta":[135,210],"vacinacao":[75,105],"castracao-cao":[530,990],"castracao-gato":[380,430],"aplicacao-medicacao":[25,45],"coleta-exames":[50,75],"curativos":[35,60],"eutanasia":[300,460]}');

-- Falha cedo se algum perfil ficou sem vínculos (ou vice-versa).
do $$
begin
  if exists (
    select 1 from public.veterinarians v
    where v.is_demo and not exists (select 1 from demo_perfil p where p.slug = v.slug)
  ) or exists (
    select 1 from demo_perfil p
    where not exists (select 1 from public.veterinarians v where v.slug = p.slug)
  ) then
    raise exception 'seed demo: perfis e vínculos não batem';
  end if;
end $$;

insert into public.veterinarian_species (veterinarian_id, species_id)
select v.id, s.id
from demo_perfil p
join public.veterinarians v on v.slug = p.slug
cross join unnest(p.especies) as e(slug)
join public.species s on s.slug = e.slug;

insert into public.veterinarian_specialties (veterinarian_id, specialty_id, principal)
select v.id, sp.id, sp.slug = p.principal
from demo_perfil p
join public.veterinarians v on v.slug = p.slug
cross join unnest(p.areas) as a(slug)
join public.specialties sp on sp.slug = a.slug;

insert into public.veterinarian_attendance_modes (veterinarian_id, attendance_mode_id)
select v.id, am.id
from demo_perfil p
join public.veterinarians v on v.slug = p.slug
cross join unnest(p.modos) as m(slug)
join public.attendance_modes am on am.slug = m.slug;

insert into public.veterinarian_coverage_regions (veterinarian_id, region_id)
select v.id, r.id
from demo_perfil p
join public.veterinarians v on v.slug = p.slug
cross join unnest(p.cobertura) as c(slug)
join public.regions r on r.slug = c.slug;

insert into public.veterinarian_payment_methods (veterinarian_id, payment_method_id, parcelas_max)
select v.id, pm.id, case when pm.slug = 'parcelamento' then p.parcelas end
from demo_perfil p
join public.veterinarians v on v.slug = p.slug
cross join unnest(p.pagamentos) as pg(slug)
join public.payment_methods pm on pm.slug = pg.slug;

insert into public.veterinarian_services (veterinarian_id, service_id, preco_min, preco_max)
select v.id, s.id, (sv.value ->> 0)::numeric, (sv.value ->> 1)::numeric
from demo_perfil p
join public.veterinarians v on v.slug = p.slug
cross join jsonb_each(p.servicos) as sv
join public.services s on s.slug = sv.key;

-- Confere que nenhum slug de catálogo foi digitado errado (join descartaria em silêncio).
do $$
declare
  esperado int;
  obtido int;
begin
  select sum(cardinality(especies) + cardinality(areas) + cardinality(modos)
             + cardinality(cobertura) + cardinality(pagamentos)
             + (select count(*) from jsonb_object_keys(servicos)))
    into esperado from demo_perfil;

  select (select count(*) from public.veterinarian_species vs join public.veterinarians v on v.id = vs.veterinarian_id where v.is_demo)
       + (select count(*) from public.veterinarian_specialties vs join public.veterinarians v on v.id = vs.veterinarian_id where v.is_demo)
       + (select count(*) from public.veterinarian_attendance_modes vs join public.veterinarians v on v.id = vs.veterinarian_id where v.is_demo)
       + (select count(*) from public.veterinarian_coverage_regions vs join public.veterinarians v on v.id = vs.veterinarian_id where v.is_demo)
       + (select count(*) from public.veterinarian_payment_methods vs join public.veterinarians v on v.id = vs.veterinarian_id where v.is_demo)
       + (select count(*) from public.veterinarian_services vs join public.veterinarians v on v.id = vs.veterinarian_id where v.is_demo)
    into obtido;

  if esperado <> obtido then
    raise exception 'seed demo: % vínculos esperados, % inseridos (slug de catálogo inválido?)', esperado, obtido;
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- Locais de atendimento (nomes e endereços inventados; coordenadas aproximadas
-- do bairro)
-- -----------------------------------------------------------------------------
insert into public.clinics (veterinarian_id, nome, endereco, region_id, neighborhood_id, lat, lng)
select v.id, c.nome, c.endereco, r.id, n.id, c.lat, c.lng
from (values
  ('dra-camila-yamashita',     'Consultório Dra. Camila Yamashita',     'Rua das Hortênsias, 214',         'mogi-das-cruzes',       'vila-oliveira',      -23.529810, -46.194520),
  ('dr-rafael-montanari',      'Montanari Ortopedia Veterinária',       'Avenida dos Ipês, 1380, sala 12', 'mogi-das-cruzes',       'mogilar',            -23.514630, -46.181270),
  ('dra-beatriz-okuma',        'Okuma Aves e Exóticos',                 'Rua dos Sabiás, 77',              'mogi-das-cruzes',       'bras-cubas',         -23.536920, -46.224810),
  ('dra-mariana-salles',       'Salles Dermatologia Veterinária',       'Rua das Magnólias, 509, sala 3',  'mogi-das-cruzes',       'centro',             -23.522470, -46.187930),
  ('dr-henrique-tavares',      'Clínica Veterinária Tavares',           'Rua dos Jacarandás, 1021',        'mogi-das-cruzes',       'cesar-de-souza',     -23.506140, -46.155820),
  ('dra-patricia-oshiro',      'Consultório Oshiro',                    'Rua das Begônias, 88',            'mogi-das-cruzes',       'jundiapeba',         -23.545720, -46.259370),
  ('dr-vinicius-carneiro',     'Consultório Veterinário Carneiro',      'Rua dos Cravos, 315',             'mogi-das-cruzes',       'jundiapeba',         -23.547310, -46.262140),
  ('dra-aline-kobayashi',      'Kobayashi Cardiologia Veterinária',     'Rua das Camélias, 640, sala 21',  'suzano',                'centro',             -23.542880, -46.310640),
  ('dr-marcos-vinicius-prado', 'Clínica Veterinária Prado',             'Rua dos Girassóis, 432',          'suzano',                'vila-amorim',        -23.534920, -46.299710),
  ('dra-renata-cunha',         'Cunha Oncologia Veterinária',           'Avenida das Palmeiras Imperiais, 905', 'suzano',           'centro',             -23.544160, -46.312380),
  ('dr-paulo-hideki-sato',     'Clínica Veterinária Sato',              'Rua dos Bem-te-vis, 156',         'suzano',                'palmeiras',          -23.579840, -46.340210),
  ('dra-sabrina-moura',        'Moura Odontologia Veterinária',         'Rua das Orquídeas, 270',          'suzano',                'centro',             -23.541570, -46.309180),
  ('dra-adriana-ferreira-lima','Clínica Veterinária Ferreira Lima',     'Rua das Gardênias, 1190',         'itaquaquecetuba',       'vila-virginia',      -23.475390, -46.355120),
  ('dra-ingrid-rocha',         'Rocha Medicina Felina',                 'Rua dos Lírios, 63',              'itaquaquecetuba',       'centro',             -23.486420, -46.348270),
  ('dr-fabio-guimaraes',       'Clínica Veterinária Guimarães',         'Avenida das Acácias, 2045',       'aruja',                 'centro',             -23.396250, -46.320840),
  ('dra-carolina-mendes',      'Consultório Dra. Carolina Mendes',      'Rua das Violetas, 348',           'poa',                   'centro',             -23.528310, -46.344670),
  ('dr-rodrigo-albuquerque',   'Albuquerque Oftalmologia Veterinária',  'Rua dos Pessegueiros, 721',       'poa',                   'calmon-viana',       -23.520140, -46.320560),
  ('dra-tatiane-gomes',        'Consultório Veterinário Gomes',         'Rua das Margaridas, 97',          'ferraz-de-vasconcelos', 'vila-romanopolis',   -23.549870, -46.374630),
  ('dra-luciana-bastos',       'Clínica Veterinária Bastos',            'Rua dos Coqueiros, 182',          'santa-isabel',          'centro',             -23.315920, -46.223470),
  ('dra-isabela-correa',       'Consultório Dra. Isabela Corrêa',       'Rua das Azaleias, 45',            'guararema',             'centro',             -23.414860, -46.035190),
  ('dr-antonio-carlos-ribeiro','Consultório Veterinário Ribeiro',       'Rua dos Cedros, 260',             'salesopolis',           'centro',             -23.531740, -45.846280),
  ('dra-priscila-nascimento',  'Clínica Veterinária Nascimento',        'Rua das Tulipas, 590',            'itaquera',              'itaquera',           -23.540270, -46.455830),
  ('dra-yasmin-oliveira',      'Oliveira Clínica de Exóticos',          'Rua dos Canários, 1312',          'itaquera',              'jose-bonifacio',     -23.554930, -46.430260),
  ('dr-claudio-hirata',        'Clínica e Odontologia Veterinária Hirata', 'Rua das Paineiras, 877',       'sao-mateus',            'sao-mateus',         -23.606130, -46.478920),
  ('dr-gilberto-lacerda',      'Hospital Veterinário 24h Lacerda',      'Avenida dos Flamboyants, 3150',   'sao-mateus',            'iguatemi',           -23.595340, -46.420870),
  ('dra-vanessa-lopes',        'Consultório Dra. Vanessa Lopes',        'Rua dos Manacás, 402',            'penha',                 'penha',              -23.526180, -46.543920),
  ('dr-guilherme-pacheco',     'Clínica Veterinária Pacheco',           'Rua das Quaresmeiras, 1166',      'penha',                 'vila-matilde',       -23.535410, -46.529870),
  ('dra-roberta-campos',       'Campos Neurologia Veterinária',         'Rua dos Plátanos, 830, sala 54',  'mooca',                 'tatuape',            -23.540320, -46.575940),
  ('dr-felipe-amaral',         'Amaral Imagem Veterinária',             'Rua das Figueiras, 215',          'mooca',                 'mooca',              -23.558160, -46.597230),
  ('dr-ricardo-belmonte',      'Clínica Veterinária Belmonte',          'Rua dos Carvalhos, 509',          'mooca',                 'belem',              -23.542870, -46.589610),
  ('dra-debora-figueiredo',    'Consultório Veterinário Figueiredo',    'Rua das Amoreiras, 744',          'aricanduva',            'vila-formosa',       -23.564720, -46.540180),
  ('dr-otavio-rangel',         'Consultório Veterinário Rangel',        'Rua dos Salgueiros, 129',         'aricanduva',            'carrao',             -23.552360, -46.541750),
  ('dra-simone-azevedo',       'Clínica Veterinária Azevedo',           'Rua das Jabuticabeiras, 361',     'vila-prudente',         'vila-prudente',      -23.583190, -46.580420),
  ('dr-kleber-moreira',        'Consultório Veterinário Moreira',       'Rua dos Bambus, 58',              'sapopemba',             'sapopemba',          -23.604870, -46.510360),
  ('dra-rosana-barbosa',       'Clínica Veterinária Barbosa',           'Rua das Primaveras, 1503',        'sao-miguel-paulista',   'sao-miguel',         -23.498240, -46.444170),
  ('dra-jessica-valente',      'Consultório Veterinário Valente',       'Rua dos Jasmins, 219',            'itaim-paulista',        'vila-curuca',        -23.508630, -46.416940),
  ('dr-renan-castro',          'Clínica Veterinária Castro',            'Rua das Mangueiras, 674',         'guaianases',            'guaianases',         -23.542910, -46.414780)
) as c(vet_slug, nome, endereco, region_slug, bairro_slug, lat, lng)
join public.veterinarians v on v.slug = c.vet_slug
join public.regions r on r.slug = c.region_slug
left join public.neighborhoods n on n.region_id = r.id and n.slug = c.bairro_slug;

-- Todo vet com modalidade clinica_propria precisa de pelo menos um local, e vice-versa.
do $$
begin
  if exists (
    select 1 from demo_perfil p
    join public.veterinarians v on v.slug = p.slug
    where ('clinica_propria' = any (p.modos)) <> exists (select 1 from public.clinics c where c.veterinarian_id = v.id)
  ) then
    raise exception 'seed demo: modalidade clinica_propria e tabela clinics não batem';
  end if;
  if exists (select 1 from public.clinics c join public.veterinarians v on v.id = c.veterinarian_id
             where v.is_demo and c.neighborhood_id is null) then
    raise exception 'seed demo: clínica com bairro inválido';
  end if;
end $$;

commit;
