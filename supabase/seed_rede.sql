-- VetMeet: publicações de demonstração da Rede (posts, curtidas e comentários).
--
-- Tudo aqui pertence a perfis demo (is_demo = true) e sai junto com eles no
-- script supabase/scripts/remove_demo.sql (on delete cascade).
-- Textos fictícios, sem nenhum dado de tutor e sem promessa de resultado.
-- Os ids são derivados de "slug:n" (md5), então rodar de novo não duplica nada.
--
-- Uso: depois de supabase/seed.sql, cole no SQL Editor ou rode com psql.

begin;

create temp table _posts_demo (
  slug text not null,
  n int not null,
  categoria public.post_categoria not null,
  dias int not null,
  hora time not null,
  especies text[] not null,
  servicos text[] not null,
  texto text not null
) on commit drop;

insert into _posts_demo values
-- Mogi das Cruzes ---------------------------------------------------------
('dra-camila-yamashita', 1, 'dica_tutores', 3, '19:40', '{gatos}', '{consulta}',
$t$Gato que esconde dor é a regra, não a exceção.

Alguns sinais que costumam passar batido em casa:
- parou de subir no lugar alto de sempre;
- usa a caixa de areia, mas sai rápido ou faz fora dela;
- se lambe demais num ponto só;
- fica mais tempo escondido ou mais irritado quando alguém encosta.

Nenhum desses sinais fecha diagnóstico sozinho, mas todos valem uma consulta. Quanto mais cedo a gente investiga, mais simples costuma ser o caminho.$t$),
('dra-camila-yamashita', 2, 'bastidores', 24, '08:15', '{caes,gatos}', '{}',
$t$Segunda-feira, 7h50, e a sala de espera já com três pacientes. Um café, prontuários abertos e bora.

Uma coisa que mudou muito minha rotina este ano: separar os horários de gatos dos de cães nas manhãs de terça. Menos latido, menos estresse, consulta mais tranquila para todo mundo (inclusive para mim).$t$),
('dr-henrique-tavares', 1, 'atendimento', 6, '23:10', '{caes}', '{consulta,ultrassonografia}',
$t$Plantão por telefone na madrugada de ontem: vômito repetido e barriga distendida num cão de porte grande. Pedi para virem direto para a clínica.

Deixo o registro porque é um quadro em que tempo faz diferença. Se o seu cão de peito fundo (pastor, dogue, weimaraner, entre outros) tentar vomitar sem conseguir e a barriga crescer, não espere amanhecer: procure atendimento na hora.$t$),
('dr-henrique-tavares', 2, 'bastidores', 33, '14:00', '{}', '{}',
$t$Chegou o aparelho de ultrassom novo aqui em César de Souza. Passei a semana revendo protocolos de exame com a equipe e organizando a agenda para que o exame aconteça na mesma consulta, sem precisar remarcar.

Clínica pequena tem disso: cada investimento é pensado para encurtar o caminho do paciente.$t$),
('dr-rafael-montanari', 1, 'relato_caso', 9, '18:30', '{caes}', '{consulta}',
$t$Paciente: cão sem raça definida, 6 anos, 28 kg, mancando da pata traseira esquerda há duas semanas, pior depois de correr.

No exame ortopédico, teste de gaveta positivo, compatível com ruptura do ligamento cruzado cranial. Radiografia para avaliar a articulação e descartar outras causas.

Discutimos as opções de tratamento, cirúrgico e conservador, com os prós e contras de cada uma para o porte e a rotina dele. Cada caso tem a sua indicação; o importante é não deixar a claudicação "se resolver sozinha" por semanas.$t$),
('dr-rafael-montanari', 2, 'curso_capacitacao', 41, '10:00', '{caes}', '{}',
$t$Fim de semana de curso prático de osteossíntese em São Paulo. Dois dias inteiros de laboratório, revisando técnicas de placa e parafuso e discutindo casos com colegas de vários estados.

Volto com algumas ideias para melhorar o planejamento pré-operatório aqui no consultório.$t$),
('dra-mariana-salles', 1, 'dica_tutores', 2, '12:20', '{caes,gatos}', '{consulta}',
$t$Banho toda semana não trata coceira.

Muito tutor chega dizendo que já tentou de tudo: xampu de farmácia, banho a cada três dias, troca de ração por conta própria. A coceira é um sintoma com várias causas possíveis (pulga, alergia alimentar, dermatite atópica, fungo, bactéria) e cada uma pede um caminho diferente.

Antes de mudar tudo de uma vez, vale investigar. Mudar várias coisas ao mesmo tempo só deixa mais difícil descobrir o que estava causando o problema.$t$),
('dra-mariana-salles', 2, 'relato_caso', 19, '16:45', '{caes}', '{consulta,coleta-exames}',
$t$Otite que volta todo mês: um padrão que vejo bastante no consultório.

Paciente recente, cocker de 4 anos, com quatro episódios de otite no último ano. Fizemos citologia do ouvido e, além de tratar o episódio atual, investigamos a causa de base, que nesse caso apontou para dermatite atópica.

Otite recorrente quase sempre é a ponta de outro problema. Tratar só o ouvido alivia, mas não costuma resolver o ciclo.$t$),
('dra-beatriz-okuma', 1, 'dica_tutores', 5, '20:05', '{aves}', '{consulta}',
$t$Calopsita estufada, quieta no fundo da gaiola e de olho fechado não está "com sono".

Aves escondem doença por instinto. Quando o sinal fica visível, muitas vezes o quadro já avançou. Se notar a ave mais quieta, com penas arrepiadas o tempo todo, comendo menos ou com fezes diferentes, procure atendimento com quem atende aves.

E, enquanto isso, mantenha o ambiente aquecido e sem corrente de ar.$t$),
('dra-beatriz-okuma', 2, 'atendimento', 27, '15:30', '{exoticos}', '{consulta}',
$t$Atendimentos da semana: dois coelhos com crescimento excessivo dos dentes, um jabuti com casco amolecido e um porquinho-da-índia com falta de apetite.

Em comum: quase todos estavam com a dieta longe do ideal. Feno à vontade para coelhos e porquinhos e luz adequada para répteis resolvem muita coisa antes de virar problema.$t$),
('dr-vinicius-carneiro', 1, 'bastidores', 12, '09:00', '{caes,gatos}', '{vacinacao}',
$t$Sábado de vacinação aqui em Jundiapeba. Fila desde cedo, muito filhote e muita conversa boa sobre vermífugo e controle de pulga.

Abri o consultório no bairro justamente para isso: estar perto de quem precisa. Obrigado a todo mundo que passou por aqui.$t$),
('dra-gabriela-nunes', 1, 'dica_tutores', 8, '07:45', '{caes}', '{}',
$t$Três ajustes simples em casa para cães idosos ou com dor articular:

1. Tapetes antiderrapantes nos caminhos que ele mais usa. Piso liso faz o cão travar a musculatura para não escorregar.
2. Rampa ou degrau para sofá e cama, em vez de pular.
3. Caminhadas mais curtas e mais frequentes, em vez de um passeio longo por dia.

São mudanças pequenas que ajudam no conforto do dia a dia. O plano de fisioterapia em si sempre depende da avaliação de cada paciente.$t$),
('dra-gabriela-nunes', 2, 'curso_capacitacao', 46, '11:30', '{caes}', '{}',
$t$Concluí o módulo de hidroterapia da especialização em reabilitação. Foram semanas estudando biomecânica na água, protocolos para pós-operatório de coluna e contraindicações.

Por enquanto atendo em domicílio, então os exercícios em casa continuam sendo a base. Mas é bom ter mais ferramentas para indicar quando faz sentido.$t$),

-- Suzano -----------------------------------------------------------------
('dr-marcos-vinicius-prado', 1, 'outros', 4, '18:00', '{caes,gatos}', '{}',
$t$Uma coisa que faço desde que abri a clínica: ligar no dia seguinte para saber como o paciente passou.

Leva uns minutos e evita muita dúvida que o tutor não teve coragem de perguntar na hora. Clínica de bairro tem que ter esse cuidado.$t$),
('dr-marcos-vinicius-prado', 2, 'dica_tutores', 29, '13:15', '{caes,gatos}', '{vacinacao}',
$t$Carteirinha de vacina perdida não é motivo para pânico.

Traga o que tiver: foto antiga, nota fiscal, nome da clínica onde vacinou. Se não der para confirmar o histórico, a gente monta um protocolo a partir de agora. O que não dá é ficar sem vacinar por medo de "vacinar duas vezes".$t$),
('dr-paulo-hideki-sato', 1, 'atendimento', 11, '10:40', '{caes,gatos}', '{ultrassonografia}',
$t$Ter o ultrassom na própria sala de consulta muda a dinâmica do atendimento. Em vários casos de vômito ou dor abdominal, conseguimos fazer o exame na mesma hora e já sair com um direcionamento.

Nem toda consulta precisa de exame de imagem, claro. Mas quando precisa, ganhar alguns dias faz diferença.$t$),
('dra-aline-kobayashi', 1, 'dica_tutores', 7, '21:00', '{caes}', '{consulta}',
$t$Contar a respiração do cão dormindo é um dos exames mais úteis que o tutor pode fazer em casa, principalmente em cardiopatas.

Conte quantas vezes o peito sobe em 30 segundos e multiplique por dois, com o cão em sono tranquilo. Anote os valores ao longo dos dias e leve para a consulta.

Se notar aumento persistente ou esforço para respirar, procure o veterinário que acompanha o caso.$t$),
('dra-aline-kobayashi', 2, 'curso_capacitacao', 38, '17:20', '{caes,gatos}', '{ultrassonografia}',
$t$Semana de congresso de cardiologia veterinária. Muita discussão sobre ecocardiograma em gatos e sobre como detectar cardiomiopatia antes de aparecerem os sinais clínicos.

Gato com sopro ou ritmo de galope na ausculta merece investigação, mesmo parecendo bem em casa.$t$),
('dra-renata-cunha', 1, 'dica_tutores', 10, '19:00', '{caes,gatos}', '{coleta-exames}',
$t$Achou um caroço no seu cão ou gato? Não espere para "ver se cresce".

Muitos nódulos são benignos, mas só dá para saber investigando. Uma punção com agulha fina, feita no consultório e quase sempre sem anestesia, já ajuda muito a direcionar.

Anote quando percebeu, meça com uma régua e tire foto. Essas informações ajudam na consulta.$t$),
('dra-renata-cunha', 2, 'outros', 35, '20:30', '{caes,gatos}', '{}',
$t$Na oncologia, boa parte do meu trabalho é conversar. Explicar o diagnóstico, as opções, o que cada uma envolve e o que esperar.

Não existe resposta igual para todas as famílias. Existe a decisão mais adequada para aquele paciente e para aquela casa, tomada com informação. É isso que tento oferecer em cada consulta.$t$),

-- Itaquaquecetuba, Arujá, Poá, Ferraz ------------------------------------
('dra-adriana-ferreira-lima', 1, 'bastidores', 15, '08:30', '{caes,gatos}', '{castracao-cao,castracao-gato}',
$t$Mutirão de castração do semestre encerrado aqui em Itaquá. Equipe chegou antes das 7h, avaliação pré-anestésica de todos os pacientes, e no fim do dia ainda deu tempo de organizar o retorno de cada um.

Castração é cuidado com o animal e com a cidade. Já estamos montando a lista para o próximo.$t$),
('dra-adriana-ferreira-lima', 2, 'dica_tutores', 50, '12:00', '{caes,gatos}', '{castracao-cao,castracao-gato}',
$t$Pós-operatório de castração em casa, o básico:

- colar ou roupinha cirúrgica o tempo todo, inclusive à noite;
- nada de banho até a retirada dos pontos;
- repouso, sem pular em sofá ou subir escada;
- se o curativo molhar, sangrar ou a ferida inchar, fale com quem fez a cirurgia.

E nada de pomada caseira em cima dos pontos.$t$),
('dra-ingrid-rocha', 1, 'dica_tutores', 1, '20:45', '{gatos}', '{consulta}',
$t$Como levar o gato à consulta com menos estresse:

1. Deixe a caixa de transporte aberta na sala dias antes, com uma manta que ele já usa.
2. Na hora de sair, cubra a caixa com um pano.
3. No carro, caixa firme no banco, nada de deixar solta.
4. Chegando aqui, a caixa fica no alto, longe do chão.

Aqui o consultório é só para gatos, mas essas dicas valem para qualquer lugar.$t$),
('dra-ingrid-rocha', 2, 'relato_caso', 22, '17:00', '{gatos}', '{coleta-exames}',
$t$Paciente: gata de 12 anos, castrada, perdendo peso aos poucos apesar de comer bem. A família achou que era "da idade".

Nos exames, alteração compatível com hipertireoidismo. Começamos o tratamento e o acompanhamento com exames periódicos.

Gato idoso emagrecendo não é normal da idade. Check-up anual (ou semestral, a partir dos 10 anos) ajuda a pegar essas mudanças cedo.$t$),
('dr-wesley-batista', 1, 'atendimento', 13, '16:20', '{caes}', '{consulta}',
$t$Muitos dos meus pacientes em Itaquá e Arujá são idosos que já não aguentam bem o carro. Atender em casa permite examinar com calma, no lugar onde o animal se sente seguro.

Esta semana foram três cães acima de 14 anos. Ajustes de medicação para dor, conversa sobre alimentação e sobre adaptação da casa.$t$),
('dr-fabio-guimaraes', 1, 'dica_tutores', 17, '18:50', '{caes,gatos}', '{coleta-exames}',
$t$Sede demais e xixi demais são sinais que merecem atenção.

Se o seu cão ou gato passou a esvaziar o pote de água mais rápido, ou o tapete higiênico está encharcado, observe e leve para avaliação. Diabetes, doença renal e alterações hormonais estão entre as causas possíveis, e exames de sangue e urina ajudam a diferenciar.

Dica prática: meça quanta água você coloca e quanto sobra em 24 horas. É uma informação valiosa na consulta.$t$),
('dr-fabio-guimaraes', 2, 'curso_capacitacao', 52, '09:30', '{caes,gatos}', '{}',
$t$Terminei a pós em endocrinologia veterinária. Dois anos de estudo sobre diabetes, tireoide e adrenal em cães e gatos.

O que mais levo para o consultório: paciente endócrino precisa de acompanhamento contínuo e de um tutor bem orientado. Consulta de retorno não é formalidade.$t$),
('dr-rodrigo-albuquerque', 1, 'dica_tutores', 6, '11:10', '{caes,gatos}', '{consulta}',
$t$Olho vermelho, lacrimejando ou fechado não é caso para colírio de farmácia.

Uma úlcera de córnea, por exemplo, pode piorar com o colírio errado. Se o seu animal estiver piscando muito, com secreção ou evitando claridade, procure atendimento. Na oftalmologia, alguns dias de diferença contam.$t$),
('dr-rodrigo-albuquerque', 2, 'atendimento', 31, '15:45', '{caes}', '{consulta}',
$t$Shih-tzu, pug, lhasa e buldogue francês são raças que vejo com frequência no consultório. O olho mais exposto deixa a córnea mais vulnerável a ressecamento e lesões.

Para essas raças, vale incluir a avaliação oftalmológica nas consultas de rotina, mesmo sem queixa.$t$),
('dra-carolina-mendes', 1, 'dica_tutores', 14, '19:30', '{caes}', '{consulta}',
$t$Cheiro forte no ouvido, cabeça balançando e coceira atrás da orelha: sinais clássicos de otite.

Evite limpar com cotonete ou produtos sem orientação. A limpeza certa depende do que está acontecendo dentro do ouvido, e isso a gente só sabe examinando.$t$),
('dra-tatiane-gomes', 1, 'bastidores', 20, '07:30', '{caes,gatos}', '{}',
$t$Aqui em Ferraz, de manhã atendo por ordem de chegada. Isso significa abrir às 8h e nunca saber como vai ser o dia.

Hoje foram vacinas, um curativo, uma consulta de filhote e um gato que veio só para "dar uma olhada" e acabou sendo o caso mais interessante da manhã.$t$),
('dra-fernanda-matsumoto', 1, 'dica_tutores', 9, '13:40', '{caes,gatos}', '{consulta}',
$t$Petisco também conta nas calorias do dia.

Em muitos pacientes acima do peso, a ração está na quantidade certa, mas os petiscos, os pedaços de pão e o "só um pouquinho" do almoço somam muito. Uma regra prática: petiscos não devem passar de 10% do que o animal come no dia.

Plano de emagrecimento sempre com acompanhamento, sem cortar comida por conta própria.$t$),
('dra-fernanda-matsumoto', 2, 'atendimento', 40, '17:10', '{caes}', '{consulta}',
$t$Consultas de acompanhamento nutricional em domicílio esta semana em Suzano e Poá. Pesagem, avaliação de escore corporal e ajuste do plano alimentar.

Em casa dá para ver detalhes que o consultório não mostra: onde fica o pote, quem alimenta, a rotina de passeios. Ajuda muito a montar um plano que a família consiga seguir.$t$),
('dr-diego-farias', 1, 'atendimento', 18, '21:30', '{exoticos}', '{consulta}',
$t$Atendimento em casa a um coelho que tinha parado de comer desde a manhã. Coelho sem comer é urgência, e a orientação foi encaminhar para avaliação com exames ainda no mesmo dia.

Se o seu coelho parar de comer ou de fazer cocô, não espere o dia seguinte.$t$),
('dr-lucas-andrade', 1, 'bastidores', 2, '22:15', '{caes,gatos}', '{}',
$t$Formado há pouco mais de um ano, atendendo em domicílio à noite e nos fins de semana. É o horário em que muita gente consegue estar em casa com o animal.

Cada visita é um aprendizado. E sempre que um caso pede mais estrutura, encaminho sem hesitar.$t$),
('dra-juliana-reis', 1, 'dica_tutores', 4, '16:00', '{caes}', '{consulta}',
$t$Ansiedade de separação não se resolve com bronca.

Quando o cão destrói a porta ou late sem parar enquanto você está fora, ele não está "se vingando". É sofrimento. Brigar na volta só aumenta a ansiedade ligada à sua saída e chegada.

O caminho envolve treino gradual, rotina previsível e, em alguns casos, apoio de medicação. Cada plano é montado depois de entender a rotina da casa.$t$),
('dra-juliana-reis', 2, 'dica_tutores', 26, '10:20', '{gatos}', '{consulta}',
$t$Xixi fora da caixa é uma das queixas que mais atendo em gatos.

Antes de pensar em comportamento, é preciso descartar causas médicas, como cistite e cálculos. Depois, olhar o ambiente: número de caixas (uma por gato, mais uma), tipo de areia, limpeza e localização longe da comida e de barulho.

Gato não faz xixi fora da caixa "por birra".$t$),
('dra-livia-cardoso', 1, 'dica_tutores', 11, '20:00', '{caes,gatos}', '{consulta}',
$t$Dieta caseira pode ser uma ótima opção, desde que formulada.

Arroz, frango e cenoura sem ajuste de cálcio, vitaminas e minerais podem deixar o animal deficiente ao longo dos meses, mesmo parecendo saudável. Uma dieta caseira balanceada é calculada para aquele paciente, considerando peso, idade e condições de saúde.

Atendo por videochamada, então dá para ajustar o cardápio com a família de qualquer lugar.$t$),
('dra-livia-cardoso', 2, 'curso_capacitacao', 44, '18:00', '{caes,gatos}', '{}',
$t$Encontro online de nutrição clínica com colegas de vários estados. O tema da vez: manejo nutricional da doença renal crônica em gatos.

Cada vez mais a nutrição entra como parte do tratamento, e não só como detalhe.$t$),

-- Guararema, Salesópolis, Biritiba, Santa Isabel (incluindo grandes animais)
('dr-jose-arimateia-santos', 1, 'bastidores', 8, '06:30', '{equinos,ruminantes}', '{vacinacao}',
$t$Cinco e meia da manhã, estrada de terra entre Biritiba e Salesópolis. Calendário de vacinação de rebanho não espera.

Vinte e poucos anos fazendo isso e ainda acho bonito o nascer do sol no meio do caminho.$t$),
('dr-jose-arimateia-santos', 2, 'dica_tutores', 37, '12:30', '{equinos}', '{consulta}',
$t$Cólica em cavalo é emergência.

Se o animal está olhando para o flanco, deitando e levantando, rolando ou sem fazer fezes, ligue para o veterinário. Enquanto espera, tire o alimento e mantenha o cavalo em local seguro, sem forçar caminhada longa.

Quanto antes a avaliação, mais opções de tratamento existem.$t$),
('dr-marcelo-teixeira', 1, 'atendimento', 16, '14:20', '{ruminantes}', '{consulta,coleta-exames}',
$t$Semana de visitas a propriedades leiteiras em Guararema. Avaliação de escore corporal das vacas, conversa sobre a dieta no período seco e coleta de amostras para exames do rebanho.

Saúde de rebanho é trabalho de prevenção, feito com o produtor ao longo do ano.$t$),
('dr-marcelo-teixeira', 2, 'curso_capacitacao', 49, '19:15', '{ruminantes,suinos}', '{}',
$t$Dia de campo sobre bem-estar animal na produção, com produtores da região. Falamos de manejo de bezerros, ambiência para suínos e transporte.

Bem-estar não é só obrigação: costuma andar junto com produtividade.$t$),
('dra-nathalia-pereira', 1, 'dica_tutores', 21, '10:50', '{equinos}', '{consulta}',
$t$Cavalo deixando cair comida da boca, mastigando de lado ou perdendo peso pode estar com problema dentário.

Avaliação odontológica periódica faz parte do cuidado com equinos, inclusive de quem não está em competição. Os dentes do cavalo crescem a vida toda e podem formar pontas que machucam a bochecha e a língua.$t$),
('dra-nathalia-pereira', 2, 'bastidores', 43, '16:40', '{equinos}', '{}',
$t$Manhã inteira em uma hípica de Arujá, avaliando os animais da escola de equitação. Dentes, cascos, vacinação em dia e conversa com a equipe de tratadores.

Os tratadores são os primeiros a perceber quando um cavalo está diferente. Vale muito ouvir o que eles têm a dizer.$t$),
('dr-antonio-carlos-ribeiro', 1, 'outros', 13, '17:30', '{caes,gatos,equinos,ruminantes}', '{}',
$t$Mais de trinta anos atendendo em Salesópolis. De manhã consultório, à tarde estrada para as propriedades.

Já vacinei o filhote de um cão cujos avós eu também atendi. Cidade pequena tem dessas coisas, e é isso que me faz continuar.$t$),
('dra-elaine-santiago', 1, 'atendimento', 5, '18:10', '{caes,gatos}', '{vacinacao,consulta}',
$t$Em Biritiba Mirim, a clínica mais próxima às vezes fica a quarenta minutos. Por isso atendo em casa.

Esta semana foram vacinas, um curativo de ferida de briga e a consulta de uma gatinha que nunca tinha saído do sítio. Levo o essencial na mala e, quando o caso pede estrutura, oriento sobre o encaminhamento.$t$),
('dra-isabela-correa', 1, 'dica_tutores', 15, '12:45', '{caes}', '{consulta}',
$t$Passeio em trilha ou sítio? Antes de voltar para casa, confira o corpo do cão: orelhas, entre os dedos, axilas e virilha. Carrapato e espinho de mato aparecem bastante por aqui.

Carrapato preso deve ser removido com cuidado, sem apertar o corpo. Em caso de dúvida, traga ao consultório.$t$),
('dra-isabela-correa', 2, 'bastidores', 39, '09:20', '{}', '{}',
$t$Consultório pequeno no centro de Guararema completou três anos. Começou com uma mesa, um armário e muita vontade.

Obrigada a quem confiou desde o começo.$t$),
('dra-luciana-bastos', 1, 'relato_caso', 25, '15:00', '{ruminantes}', '{consulta}',
$t$Bezerra de dez dias com diarreia, prostrada e mamando pouco. Atendimento no sítio, com avaliação do grau de desidratação e hidratação.

Bezerro com diarreia desidrata rápido. Na dúvida, chame cedo: em casos assim, o tempo de resposta pesa muito.$t$),
('dra-luciana-bastos', 2, 'outros', 54, '19:50', '{caes,gatos,equinos}', '{}',
$t$Clínica de cidade pequena atende de tudo. Hoje teve cachorro, gato, um cavalo com ferida na pata e uma galinha que veio na caixa de sapato.

Não dá para saber tudo de todas as espécies, mas dá para saber quando encaminhar.$t$),
('dra-leticia-furukawa', 1, 'dica_tutores', 3, '11:00', '{gatos}', '{consulta}',
$t$Gato que passa mais de 24 horas sem comer precisa de atenção.

Diferente dos cães, gatos podem desenvolver problemas no fígado quando ficam muito tempo sem se alimentar, principalmente os acima do peso. Se o seu gato recusou a comida o dia todo, entre em contato com o veterinário.$t$),
('dra-leticia-furukawa', 2, 'atendimento', 30, '14:30', '{gatos}', '{consulta}',
$t$Atender gatos em casa me permite observar coisas que nunca vejo no consultório: onde ficam as caixas de areia, se há lugares altos, como é a convivência com outros gatos.

Muitas queixas de comportamento começam a fazer sentido quando a gente olha o ambiente.$t$),

-- Zona Leste de São Paulo ------------------------------------------------
('dr-anderson-cruz', 1, 'bastidores', 1, '13:00', '{caes,gatos}', '{}',
$t$Moto, mochila térmica e o caminho de Itaquera até Cidade Tiradentes decorado. Domiciliar na zona leste é isso: trânsito, ladeira e a satisfação de chegar rápido quando precisam.$t$),
('dr-anderson-cruz', 2, 'dica_tutores', 34, '20:20', '{caes}', '{vacinacao}',
$t$Filhote só deve passear na rua depois de completar o protocolo de vacinação indicado pelo veterinário.

Até lá, dá para socializar em casa: apresentar barulhos, pessoas conhecidas, tipos de piso diferentes. Isso ajuda muito no comportamento do adulto.$t$),
('dr-claudio-hirata', 1, 'dica_tutores', 7, '17:45', '{caes,gatos}', '{consulta}',
$t$Mau hálito em cão ou gato não é normal.

Na maioria das vezes, é sinal de doença periodontal: tártaro, gengivite e às vezes dente comprometido. Dor de dente costuma ser silenciosa nos animais, que continuam comendo mesmo com desconforto.

Escovação diária com pasta veterinária ajuda a prevenir. Se já há tártaro, só a limpeza profissional resolve.$t$),
('dr-claudio-hirata', 2, 'curso_capacitacao', 47, '10:10', '{caes,gatos}', '{}',
$t$Curso de radiologia odontológica concluído. A radiografia intraoral mostra o que está abaixo da gengiva, onde boa parte dos problemas se esconde.

Mais uma ferramenta para planejar o tratamento com segurança.$t$),
('dr-gilberto-lacerda', 1, 'bastidores', 10, '03:20', '{caes,gatos}', '{}',
$t$Três da manhã no plantão do hospital. Silêncio raro entre um atendimento e outro.

Ao pessoal que trabalha de madrugada, em qualquer profissão: o café de hoje vai em homenagem a vocês.$t$),
('dr-gilberto-lacerda', 2, 'dica_tutores', 32, '18:40', '{caes,gatos}', '{}',
$t$Quando é caso de ir ao pronto atendimento na hora:

- dificuldade para respirar ou gengiva arroxeada;
- convulsão;
- atropelamento ou queda, mesmo sem ferida aparente;
- suspeita de envenenamento;
- tentativa de vomitar sem conseguir, com barriga inchada;
- gato tentando urinar sem sair nada.

Na dúvida, ligue antes para o serviço e explique o que está acontecendo.$t$),
('dr-guilherme-pacheco', 1, 'dica_tutores', 12, '14:50', '{caes,gatos}', '{atestado-viagem,microchipagem}',
$t$Vai viajar para fora do país com o pet? Comece a se planejar com meses de antecedência.

Cada país tem exigências próprias: microchip, vacina antirrábica com prazo específico, sorologia em alguns casos e o atestado de saúde dentro da validade. Consulte as regras do destino e da companhia aérea antes de comprar a passagem.$t$),
('dr-kleber-moreira', 1, 'outros', 19, '19:00', '{caes,gatos}', '{}',
$t$Atender bem não tem a ver com consultório chique. Tem a ver com explicar direito, examinar com calma e conversar sobre o que é possível fazer dentro da realidade de cada família.

Aqui em Sapopemba, essa conversa faz parte de toda consulta.$t$),
('dr-renan-castro', 1, 'atendimento', 23, '22:40', '{caes}', '{curativos}',
$t$Fim de semana com três atendimentos de feridas por briga entre cães em Guaianases.

Mesmo quando a ferida parece pequena por fora, a mordida pode ter atingido mais fundo. Vale avaliar, limpar direito e acompanhar a cicatrização.$t$),
('dr-ricardo-belmonte', 1, 'dica_tutores', 16, '11:30', '{caes,gatos}', '{castracao-cao,castracao-gato}',
$t$Por que pedimos exames antes de uma cirurgia, mesmo em animais jovens e aparentemente saudáveis?

A avaliação pré-anestésica (exame físico, exames de sangue e, em alguns casos, avaliação cardíaca) ajuda a escolher o protocolo anestésico mais adequado para cada paciente e a identificar riscos antes do procedimento.$t$),
('dr-ricardo-belmonte', 2, 'bastidores', 45, '16:00', '{}', '{}',
$t$Reforma da sala de espera do consultório no Belém finalizada. Agora com um cantinho separado para gatos, longe do vai e vem dos cães.

Pequenas mudanças que fazem diferença para pacientes mais sensíveis.$t$),
('dr-samuel-matos', 1, 'dica_tutores', 20, '21:10', '{aves}', '{consulta}',
$t$Periquitos e calopsitas precisam de mais do que semente.

Uma dieta só de sementes é pobre em vitaminas e rica em gordura. Converse com o veterinário sobre a introdução de ração extrusada própria para a espécie, legumes e verduras adequados. A transição deve ser gradual.$t$),
('dra-carla-menezes', 1, 'atendimento', 9, '15:15', '{caes}', '{consulta}',
$t$Sessões de acupuntura em domicílio esta semana na Penha e na Mooca. A maioria dos pacientes são cães idosos com dor crônica, que já fazem acompanhamento com o clínico.

A acupuntura entra como parte do manejo da dor, junto com o tratamento indicado por quem acompanha o caso.$t$),
('dra-carla-menezes', 2, 'curso_capacitacao', 51, '13:30', '{caes,gatos}', '{}',
$t$Workshop de reabilitação de pacientes neurológicos. Muito conteúdo sobre exercícios para cães com hérnia de disco no pós-operatório e no tratamento conservador.

Reabilitação é trabalho em equipe: neurologista, clínico, fisioterapeuta e família.$t$),
('dr-felipe-amaral', 1, 'atendimento', 14, '10:00', '{caes,gatos}', '{ultrassonografia}',
$t$Agenda de ultrassom em domicílio esta semana na Mooca e em Vila Prudente. Pacientes idosos e gatos que se estressam muito no transporte são os que mais se beneficiam do exame em casa.

O laudo sai no mesmo dia e vai direto para o veterinário que pediu o exame.$t$),
('dra-debora-figueiredo', 1, 'dica_tutores', 22, '18:20', '{caes,gatos}', '{vacinacao}',
$t$Protocolo de vacina não é igual para todos.

Idade, estilo de vida (sai na rua? frequenta creche? viaja?), histórico e região influenciam quais vacinas e com que frequência. Por isso a consulta antes de vacinar é importante, e não só a aplicação.$t$),
('dra-jessica-valente', 1, 'dica_tutores', 18, '12:10', '{caes,gatos}', '{}',
$t$Controle de pulga é o ano todo, não só no verão.

Ovos e larvas ficam no ambiente (sofá, tapete, frestas do piso) e voltam a infestar o animal. Além de tratar o pet, é importante cuidar da casa. Pulga também transmite verme e pode causar alergia de pele.$t$),
('dra-michele-araujo', 1, 'bastidores', 6, '17:50', '{caes,gatos}', '{}',
$t$Comecei atendendo os bichos da vizinhança em São Mateus. Hoje faço domicílio em toda a região, mas ainda tem tutor que me chama pelo nome da rua onde cresci.

Atender perto de casa é atender quem a gente conhece.$t$),
('dra-michele-araujo', 2, 'dica_tutores', 36, '20:00', '{caes}', '{}',
$t$Dias quentes pedem cuidado com o horário do passeio.

Se o asfalto estiver quente demais para a palma da sua mão, está quente demais para as patas do seu cão. Prefira o começo da manhã ou o fim da tarde, leve água e observe sinais de cansaço excessivo, principalmente em raças de focinho curto.$t$),
('dra-priscila-nascimento', 1, 'atendimento', 4, '09:40', '{caes,gatos}', '{castracao-cao,castracao-gato}',
$t$Dia de cirurgias eletivas aqui em Itaquera. Anestesia inalatória, monitoração durante todo o procedimento e acompanhamento até o paciente acordar bem.

Antes de cada cirurgia, conversa com a família sobre o que esperar no pós-operatório. Tutor bem orientado faz parte da recuperação.$t$),
('dra-renata-cunha', 3, 'curso_capacitacao', 55, '11:00', '{caes,gatos}', '{}',
$t$Atualização em cuidados paliativos em oncologia veterinária. Controle da dor, nutrição e qualidade de vida estiveram no centro de todas as discussões.

Cuidado paliativo não é desistir: é cuidar do conforto em cada fase.$t$),
('dra-roberta-campos', 1, 'dica_tutores', 13, '16:30', '{caes,gatos}', '{consulta}',
$t$Seu animal teve uma convulsão? Algumas orientações:

- não coloque a mão na boca dele;
- afaste móveis e objetos para ele não se machucar;
- marque o tempo de duração;
- se possível, filme (ajuda muito na consulta).

Convulsão que dura mais de cinco minutos ou várias seguidas é emergência.$t$),
('dra-roberta-campos', 2, 'relato_caso', 42, '19:20', '{caes}', '{consulta}',
$t$Paciente: dachshund de 5 anos, dor ao ser pego no colo e relutância em subir escadas há três dias.

No exame neurológico, dor na região da coluna toracolombar, compatível com doença do disco intervertebral. Discutimos com a família as opções de exame de imagem e tratamento, e a importância do repouso rigoroso.

Raças de coluna longa merecem atenção a sinais de dor nas costas.$t$),
('dra-rosana-barbosa', 1, 'outros', 21, '14:00', '{caes,gatos}', '{castracao-cao,castracao-gato}',
$t$Aqui em São Miguel trabalhamos com protetores independentes há anos. É uma parceria que faz diferença no bairro: castração, vacinas e tratamento de animais resgatados.

Quem cuida dos animais da rua merece todo o apoio.$t$),
('dra-simone-azevedo', 1, 'dica_tutores', 8, '13:00', '{caes}', '{consulta}',
$t$Buldogue, shar-pei e shih-tzu têm dobras de pele que precisam de atenção.

Umidade e calor nas dobras favorecem dermatite. Limpar e secar bem, com produtos indicados pelo veterinário, faz parte da rotina dessas raças. Vermelhidão, cheiro forte ou secreção nas dobras pedem avaliação.$t$),
('dra-vanessa-lopes', 1, 'dica_tutores', 11, '21:20', '{gatos}', '{}',
$t$Gato precisa de lugar alto, arranhador e esconderijo. Não é luxo, é necessidade.

Ambiente enriquecido reduz estresse e ajuda a prevenir vários problemas de comportamento e até alguns de saúde, como a cistite idiopática. Prateleiras na parede e caixas de papelão já ajudam muito.$t$),
('dra-vanessa-lopes', 2, 'bastidores', 48, '18:30', '{gatos}', '{}',
$t$Quatro gatos em casa e um consultório na Penha cheio de felinos. Dá para dizer que a vida gira em torno deles.

Hoje uma paciente veio de caixa de transporte coberta, com feromônio e no horário mais tranquilo. Ver ela sair calma da consulta é o melhor resultado do dia.$t$),
('dra-yasmin-oliveira', 1, 'dica_tutores', 2, '15:20', '{exoticos}', '{consulta}',
$t$Antes de levar um réptil para casa, pesquise bastante.

Jabutis, lagartos e serpentes precisam de temperatura controlada, iluminação UVB e dieta específica. A maioria dos problemas que atendo vem de falhas no ambiente. E lembre: só compre de criadouros legalizados.$t$),
('dra-yasmin-oliveira', 2, 'curso_capacitacao', 53, '10:30', '{aves,exoticos}', '{}',
$t$Congresso de medicina de animais selvagens e exóticos. Muita troca sobre anestesia em aves, manejo de répteis e casos de coelhos.

Área que cresce a cada ano, com cada vez mais tutores buscando atendimento especializado.$t$),
('dr-thiago-brandao', 1, 'outros', 17, '22:00', '{caes,gatos}', '{}',
$t$Formado em 2024 e atendendo em domicílio em Mogi e Suzano. Ainda me surpreendo com a quantidade de gente que só consegue cuidar do pet à noite, depois do trabalho.

Por isso a agenda vai até mais tarde. Atender quando a família consegue estar junto faz diferença.$t$);

-- Posts (ids estáveis: md5 de "slug:n")
insert into public.posts (id, veterinarian_id, categoria, texto, created_at, updated_at)
select
  md5('demo-post:' || d.slug || ':' || d.n)::uuid,
  v.id,
  d.categoria,
  d.texto,
  (date_trunc('day', now() at time zone 'America/Sao_Paulo') - make_interval(days => d.dias) + d.hora) at time zone 'America/Sao_Paulo',
  now()
from _posts_demo d
join public.veterinarians v on v.slug = d.slug and v.is_demo
on conflict (id) do nothing;

insert into public.post_species (post_id, species_id)
select md5('demo-post:' || d.slug || ':' || d.n)::uuid, s.id
from _posts_demo d cross join lateral unnest(d.especies) e(slug) join public.species s on s.slug = e.slug
on conflict do nothing;

insert into public.post_services (post_id, service_id)
select md5('demo-post:' || d.slug || ':' || d.n)::uuid, s.id
from _posts_demo d cross join lateral unnest(d.servicos) e(slug) join public.services s on s.slug = e.slug
on conflict do nothing;

-- Fixados: alguns veterinários destacam publicações no perfil.
update public.posts set fixado_em = created_at + interval '1 hour'
where id in (
  md5('demo-post:dr-rafael-montanari:1')::uuid,
  md5('demo-post:dra-mariana-salles:2')::uuid,
  md5('demo-post:dra-ingrid-rocha:2')::uuid,
  md5('demo-post:dra-renata-cunha:1')::uuid,
  md5('demo-post:dra-renata-cunha:2')::uuid,
  md5('demo-post:dra-roberta-campos:2')::uuid
);

-- Curtidas: desiguais, como numa rede real. O "peso" de cada post define a
-- chance de cada colega curtir; a escolha é determinística (hash), sempre a mesma.
insert into public.post_likes (post_id, veterinarian_id, created_at)
select p.id, v.id, least(p.created_at + make_interval(mins => 20 + abs(hashtext(p.id::text || v.id::text)) % 4000), now())
from public.posts p
join public.veterinarians v on v.is_demo and v.status = 'ativo' and v.id <> p.veterinarian_id
where p.is_demo
  and abs(hashtext(v.slug || p.id::text)) % 100 <
      case abs(hashtext(p.id::text)) % 10
        when 0 then 2 when 1 then 4 when 2 then 6 when 3 then 8 when 4 then 10
        when 5 then 13 when 6 then 17 when 7 then 22 when 8 then 30 else 40 end
on conflict do nothing;

-- Comentários entre colegas (e respostas do autor).
create temp table _comentarios_demo (
  post_slug text, post_n int, autor text, minutos int, texto text
) on commit drop;

insert into _comentarios_demo values
('dra-camila-yamashita', 1, 'dra-leticia-furukawa', 95, 'Assino embaixo. A caixa de areia diz muito, e quase ninguém repara.'),
('dra-camila-yamashita', 1, 'dra-ingrid-rocha', 210, 'Ótima lista. Acrescentaria: dormir em lugar diferente do habitual também chama atenção.'),
('dra-camila-yamashita', 1, 'dra-camila-yamashita', 260, 'Boa, Ingrid! Mudança de rotina é sempre um sinal para observar.'),
('dra-camila-yamashita', 1, 'dra-vanessa-lopes', 600, 'Vou compartilhar com meus tutores de gatos.'),
('dr-henrique-tavares', 1, 'dr-gilberto-lacerda', 40, 'Quadro clássico de madrugada. Bom reforçar para os tutores.'),
('dr-henrique-tavares', 1, 'dra-aline-kobayashi', 300, 'Importante demais esse alerta.'),
('dr-rafael-montanari', 1, 'dra-gabriela-nunes', 130, 'E no pós, a reabilitação faz muita diferença. Sempre bom trabalhar junto.'),
('dr-rafael-montanari', 1, 'dr-rafael-montanari', 190, 'Com certeza, Gabriela. Fisioterapia faz parte do plano.'),
('dra-mariana-salles', 1, 'dra-carolina-mendes', 80, 'Isso! Mudar tudo de uma vez atrapalha muito a investigação.'),
('dra-mariana-salles', 1, 'dra-simone-azevedo', 400, 'Vejo muito isso com buldogues aqui na Vila Prudente.'),
('dra-mariana-salles', 2, 'dra-carolina-mendes', 150, 'Caso muito comum. Ótimo relato.'),
('dra-beatriz-okuma', 1, 'dra-yasmin-oliveira', 60, 'Perfeito. Ave doente esconde até o último momento.'),
('dra-beatriz-okuma', 1, 'dr-samuel-matos', 520, 'Bom lembrar do aquecimento enquanto o tutor busca atendimento.'),
('dra-beatriz-okuma', 2, 'dra-yasmin-oliveira', 240, 'Feno, feno e mais feno.'),
('dra-gabriela-nunes', 1, 'dra-carla-menezes', 75, 'Tapete antiderrapante é a primeira coisa que recomendo também.'),
('dra-gabriela-nunes', 1, 'dr-wesley-batista', 330, 'Muito útil para os meus pacientes idosos aqui em Itaquá.'),
('dra-aline-kobayashi', 1, 'dr-ricardo-belmonte', 110, 'Uma das orientações mais valiosas para cardiopatas.'),
('dra-aline-kobayashi', 1, 'dr-paulo-hideki-sato', 700, 'Ótima dica, vou passar a usar com meus pacientes.'),
('dra-renata-cunha', 1, 'dra-mariana-salles', 90, 'Medir e fotografar ajuda muito a acompanhar.'),
('dra-renata-cunha', 1, 'dr-paulo-hideki-sato', 280, 'Concordo. Punção é simples e direciona bastante.'),
('dra-renata-cunha', 2, 'dra-livia-cardoso', 360, 'Texto bonito e muito necessário.'),
('dra-adriana-ferreira-lima', 1, 'dra-rosana-barbosa', 200, 'Parabéns pelo trabalho! Mutirão é muito importante.'),
('dra-adriana-ferreira-lima', 1, 'dra-priscila-nascimento', 450, 'Que equipe! Parabéns.'),
('dra-ingrid-rocha', 1, 'dra-leticia-furukawa', 55, 'A caixa coberta faz uma diferença enorme.'),
('dra-ingrid-rocha', 1, 'dra-vanessa-lopes', 170, 'Uso as mesmas orientações por aqui.'),
('dra-ingrid-rocha', 1, 'dra-juliana-reis', 480, 'E deixar a caixa como parte da casa, não só na hora de sair. Perfeito.'),
('dra-ingrid-rocha', 2, 'dr-fabio-guimaraes', 125, 'Caso típico. Check-up em gato idoso faz toda a diferença.'),
('dra-ingrid-rocha', 2, 'dra-ingrid-rocha', 200, 'Exatamente, Fábio. Obrigada!'),
('dr-fabio-guimaraes', 1, 'dra-livia-cardoso', 140, 'Medir a água é uma ótima orientação.'),
('dr-rodrigo-albuquerque', 1, 'dra-simone-azevedo', 210, 'Muito importante. Vejo isso com frequência em braquicefálicos.'),
('dra-fernanda-matsumoto', 1, 'dra-livia-cardoso', 65, 'A regra dos 10% ajuda demais na conversa com o tutor.'),
('dr-diego-farias', 1, 'dra-yasmin-oliveira', 45, 'Isso! Coelho sem comer não pode esperar.'),
('dr-diego-farias', 1, 'dra-beatriz-okuma', 160, 'Ótimo reforço.'),
('dr-lucas-andrade', 1, 'dr-marcos-vinicius-prado', 300, 'Bom ver colegas novos cobrindo esse horário. Sucesso!'),
('dr-lucas-andrade', 1, 'dr-thiago-brandao', 360, 'Estamos juntos nessa!'),
('dra-juliana-reis', 1, 'dra-vanessa-lopes', 120, 'Muito bem explicado.'),
('dra-juliana-reis', 2, 'dra-ingrid-rocha', 90, 'Uma caixa por gato mais uma: regra de ouro.'),
('dr-jose-arimateia-santos', 1, 'dr-marcelo-teixeira', 240, 'Conheço bem essa estrada.'),
('dr-jose-arimateia-santos', 2, 'dra-nathalia-pereira', 70, 'Essencial. Quanto antes, melhor.'),
('dra-nathalia-pereira', 1, 'dr-jose-arimateia-santos', 180, 'Muito bom. Muita gente não sabe que os dentes crescem a vida toda.'),
('dr-claudio-hirata', 1, 'dra-mariana-salles', 230, 'Mau hálito é sempre sinal de alerta.'),
('dr-gilberto-lacerda', 2, 'dr-henrique-tavares', 100, 'Lista perfeita para colar na geladeira.'),
('dr-gilberto-lacerda', 2, 'dra-roberta-campos', 320, 'Incluiria também andar cambaleante de início súbito.'),
('dr-gilberto-lacerda', 2, 'dr-gilberto-lacerda', 380, 'Boa lembrança, Roberta.'),
('dra-roberta-campos', 1, 'dr-gilberto-lacerda', 85, 'Filmar ajuda demais no atendimento.'),
('dra-roberta-campos', 2, 'dra-carla-menezes', 260, 'Ótimo caso. Repouso rigoroso faz toda a diferença.'),
('dra-michele-araujo', 2, 'dr-anderson-cruz', 150, 'Teste da mão no asfalto: simples e eficiente.'),
('dra-vanessa-lopes', 1, 'dra-leticia-furukawa', 110, 'Caixa de papelão é o brinquedo favorito de todos os gatos.'),
('dra-yasmin-oliveira', 1, 'dra-beatriz-okuma', 140, 'Falha de ambiente é a principal causa do que atendo também.'),
('dr-guilherme-pacheco', 1, 'dra-camila-yamashita', 220, 'Ótima dica, sempre recebo tutor com a passagem já comprada.');

insert into public.post_comments (post_id, veterinarian_id, texto, created_at)
select md5('demo-post:' || c.post_slug || ':' || c.post_n)::uuid, v.id, c.texto,
       least(p.created_at + make_interval(mins => c.minutos), now())
from _comentarios_demo c
join public.veterinarians v on v.slug = c.autor and v.is_demo
join public.posts p on p.id = md5('demo-post:' || c.post_slug || ':' || c.post_n)::uuid
where not exists (
  select 1 from public.post_comments pc
  where pc.post_id = p.id and pc.veterinarian_id = v.id and pc.texto = c.texto
);

commit;
