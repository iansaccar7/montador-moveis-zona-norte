# Montador de móveis zona norte

Demonstração comercial do serviço de montagem do Hede em Casa Verde, Zona Norte de São Paulo. Site estático em HTML, CSS e JavaScript, baseado no fluxo de agendamento do projeto Eletricista Ronaldo Américo, com identidade e texto próprios.

## Ver a página

Abra `index.html` ou, nesta pasta, execute:

```sh
python3 -m http.server 8027
```

Acesse http://localhost:8027. Não precisa instalar dependências nem executar build. Fontes locais; a página não depende de Google Fonts, imagens externas ou bibliotecas.

## Todos os arquivos para o repositório

Mantenha esta estrutura. Todos os arquivos de fonte e licença ficam na mesma pasta que `index.html`.

```text
.nojekyll
.gitignore
README.md
index.html
style.css
script.js
favicon.svg
bricolage-grotesque-600.ttf
bricolagegrotesque-OFL.txt
figtree-variable.ttf
figtree-OFL.txt
tests/agendamento.test.cjs
```

Os arquivos HTML, CSS, JavaScript, favicon e as duas fontes compõem a página. Inclua também ambas as licenças OFL na publicação. `.nojekyll` permite servir a pasta diretamente no GitHub Pages. README e testes documentam e verificam o projeto; `.gitignore` evita arquivos locais desnecessários.

Para GitHub Pages, publique o conteúdo desta pasta na raiz do repositório e configure a publicação pela branch e pasta raiz. Nenhum domínio ou repositório remoto foi presumido.

## Agendamento

Todos os links de WhatsApp apontam para `https://wa.me/5511966173676`. O formulário monta uma mensagem com móvel, quantidade, loja/marca quando preenchida, bairro, dia, período, nome e WhatsApp. O visitante revisa e envia no WhatsApp. A página não envia a mensagem automaticamente nem armazena dados.

O dia mínimo é calculado em JavaScript usando o fuso `America/Sao_Paulo`, atualizado ao voltar à página e ao usar o formulário. Datas passadas, quantidades fracionárias e telefones incompletos são rejeitados. O ano do rodapé também é calculado em JavaScript. Dia e período são preferências; a visita precisa ser combinada com o Hede.

## Conteúdo e fotos

Os fatos comerciais e os três trechos de avaliações foram fornecidos pelo usuário. Não há preços, garantias, horários de atendimento, endereço completo ou perfis sociais. A descrição da página é texto próprio.

Há exatamente quatro espaços de foto, com o rótulo “Foto de uma montagem” e um único aviso na seção. O desenho no hero é um elemento vetorial decorativo, não uma foto de trabalho. Quando houver fotos autorizadas das montagens do Hede, substitua os espaços por essas imagens; comprima-as, defina dimensões e carregue as fotos abaixo da dobra com `loading="lazy"`.

O nome comercial está concentrado no topo, nos títulos dos metadados e no rodapé, para facilitar uma futura troca.

## Verificações

```sh
node --test tests/agendamento.test.cjs
```

Testes do texto enviado ao contato correto, acentos, marca opcional, data em São Paulo, rejeição de datas passadas, quantidades inválidas, campos vazios e telefones incompletos.

Verificado em Chrome em 320, 390, 768, 1024 e 1440 px: sem rolagem horizontal, fontes locais carregadas, quatro espaços de foto, alvos de toque com pelo menos 44 × 44 px, links válidos, formulário com mensagem correta e ausência de erros no console. A abertura do WhatsApp foi interceptada durante o teste para não abrir uma conversa externa. Inspeção visual realizada em 390 e 1440 px.

Em uma simulação de 4G no Chrome (150 ms de latência, 1,6 Mbit/s de download e CPU 4× mais lenta), a carga da página levou aproximadamente 1,1 segundo. Os recursos da página somam cerca de 167 KB, incluindo as fontes; não há imagens pesadas nem chamadas externas durante a carga. Esses resultados foram medidos localmente com limitação de rede e não representam uma medição da futura hospedagem.
