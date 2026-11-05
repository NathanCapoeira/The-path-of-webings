# Character Creator 2.1 — validação

## Diagnóstico

O avatar usa um único SVG com `viewBox="0 0 160 210"`. A expansão 2.0 misturava caminhos fixos, transformações por penteado e acessórios sem metadados espaciais. Os defeitos reproduzidos foram:

- cabelos altos atravessando bonés, gorros e chapéus;
- coques e franjas alcançando a linha dos olhos;
- variações de acessórios usando o mesmo desenho genérico;
- detalhes e estampas de roupa sem recorte pela silhueta;
- miniaturas herdando acessórios de outra categoria;
- até 68 opções exibidas em uma sequência de caixas;
- página mobile muito alta e ações cobrindo opções na primeira versão.

## Estrutura corrigida

- Coordenadas compartilhadas: cabeça, olhos, orelhas, pescoço, ombros e tronco.
- Metadados obrigatórios por item: âncora, limites e camada.
- Cabelos: comprimento, textura e família de estilo.
- Roupas: tipo, estética e camada.
- Acessórios: slot, âncora e regra de encaixe de chapéu.
- Recortes independentes para roupa-base, peça externa, cabelo e chapéu.
- Navegação paginada com oito miniaturas reais por tela.

## Matriz executada

| Verificação | Cobertura | Resultado |
| --- | ---: | --- |
| Penteados selecionados e renderizados | 68 | Aprovado |
| Roupas-base selecionadas e renderizadas | 60 | Aprovado |
| Peças externas selecionadas e renderizadas | 40 | Aprovado |
| Escolhas dos quatro slots de acessórios | 36, incluindo “nenhum” | Aprovado |
| Cores de cabelo | 52 | Aprovado |
| Combinações aleatórias | 100 | Aprovado |
| Persistência após recarregar | 1 save completo | Aprovado |
| Responsividade | 320, 360, 390, 430, 768 e 1440 px | Sem overflow |
| Teclado virtual simulado | todas as larguras acima | Sem aumentar a página |
| Testes de unidade e gameplay | 43 | Aprovado |

Em cada opção foi verificado que o SVG possui dimensões finitas, não contém valores inválidos e permanece dentro do `viewBox`. A inspeção visual incluiu cabelos volumosos com chapéus, cabelos longos com peças externas, franjas com óculos, brincos em ambos os lados e todas as famílias de roupa.
