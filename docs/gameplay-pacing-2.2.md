# Validação de ritmo — atualização 2.2

Data: 2026-11-05

## Método

A linha de base foi registrada antes da alteração com o mesmo simulador de decisões usado na medição posterior. Cada decisão foi convertida em uma estimativa cadenciada de 3,1 segundos; eventos receberam mais cinco segundos de leitura. Eventos aleatórios foram desativados na comparação principal para que o mesmo percurso pudesse ser repetido. O teste de estresse seguinte força eventos e mede seu impacto separadamente.

Esses números são estimativas reprodutíveis de interação, e não sessões humanas cronometradas. A versão 2.2 também registra o tempo real durante uma partida: tempo ativo total e por fase, feed, eventos, transições, atividades, interações sociais e ciclos de sono. O resumo final mostra esses dados e exclui Diário, painel do algoritmo e jogo pausado.

## Comparação principal

O percurso de feed intenso usa segundos contínuos de feed e, por isso, não é comparável pela fórmula baseada em cliques. Ele foi validado separadamente.

| Estratégia | Dificuldade | Antes | Depois | Ciclos antes | Ciclos depois | Resultado 2.2 |
|---|---:|---:|---:|---:|---:|---|
| Equilibrado | Normal | 6min31s | 5min07s | 14 | 11 | Morte natural aos 100 |
| Equilibrado | Desafiador | 6min37s | 5min07s | 14 | 11 | Morte natural aos 100 |
| Equilibrado | Intenso | 6min37s | 5min07s | 14 | 11 | Morte natural aos 100 |
| Sem redes | Normal | 6min31s | 5min07s | 14 | 11 | Morte natural aos 100 |
| Prioriza descanso | Normal | 9min24s | 5min07s | 14 | 11 | Morte natural aos 100 |
| Prioriza atributos | Normal | 6min43s | 4min58s | 14 | 10 | Encerramento aos 80 |
| Escolhas ruins | Normal | 7min08s | 5min07s | 14 | 11 | Morte natural aos 100 |

Média dos sete percursos comparáveis: **7min04s antes e 5min06s depois**. A média de ciclos caiu de **14 para 10,9**. A estratégia equilibrada usa 33 atividades em 11 ciclos, exatamente três decisões de vida por ciclo.

## Estresse com eventos

Uma fonte aleatória determinística foi configurada para disparar todos os eventos elegíveis. O histórico global impediu repetição do mesmo evento. Todos os modos de dificuldade chegaram ao encerramento.

| Estratégia | Eventos únicos | Estimativa cadenciada |
|---|---:|---:|
| Equilibrado — Normal | 14 | 6min42s |
| Equilibrado — Desafiador | 14 | 6min42s |
| Equilibrado — Intenso | 14 | 6min42s |
| Sem redes | 14 | 6min42s |
| Prioriza descanso | 14 | 7min00s |
| Prioriza atributos | 14 | 6min42s |
| Escolhas ruins | 15 | 7min02s |

O percurso de feed intenso executou 311 segundos de consumo, 11 ciclos e 10 eventos. O feed continua avançando no ritmo original de um `SOCIAL_TICK` por segundo; navegação, algoritmo, limite de velocidade e consequências não foram modificados.

## Progressão e balanceamento

- Bebê, primeira infância, segunda infância, pré-adolescência e as duas adolescências continuam obrigatórias e aparecem na mesma ordem.
- O salto para no primeiro limite de fase encontrado. Assim, nenhum ciclo atravessa silenciosamente uma etapa inteira.
- Vida adulta avança até 14 anos por ciclo e terceira idade até 20, totalizando 11 ciclos representativos até os 100 anos.
- Crescimento de subatributos usa no máximo três anos de peso por sono. Desgaste de idade e perda de força são aplicados uma vez por ciclo, evitando multiplicação por saltos longos.
- Atividades principais ocupam quatro horas e descanso três. O ciclo típico comporta uma decisão principal e duas complementares antes do sono.
- A chance de evento após atividade caiu de 28% para 18%; transições de fase priorizam um evento relevante. IDs vistos permanecem no histórico durante toda a vida.
- Desafios são agendados nas mudanças de fase, em vez de se repetirem a cada ciclo dentro da mesma fase.

## Cobertura automatizada

Os testes percorrem as oito fases vivas e o encerramento, os três modos de dificuldade, sono, recuperação, eventos, feed, efeitos digitais, morte, salvamento/restauração e valores acima de 100 permitidos aos subatributos. Testes específicos verificam que saltos longos param no próximo limite de fase e não multiplicam desgaste, e que os contadores de tempo classificam feed, evento e transição corretamente.

A suíte final executou **46 testes sem falhas**. O fluxo real de navegador percorreu atividade, sono, mudança de fase e entrada/saída do feed em 390 px. A tela de gameplay também foi renderizada sem overflow horizontal em 320, 360, 390, 430, 768 e 1440 px. O teste de restauração confirmou uma partida salva de versão anterior sem erro de hidratação.

