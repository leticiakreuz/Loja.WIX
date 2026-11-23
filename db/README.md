# Catálogo PostgreSQL

O catálogo é consultado no servidor a cada acesso. A conexão pública do site deve usar um papel PostgreSQL com leitura apenas nas tabelas `wix.categories` e `wix.products`.

## Configuração

Defina `DATABASE_URL` nas variáveis privadas do projeto Vercel. Para executar as migrações localmente, defina `DATABASE_MIGRATION_URL` em `.env.local` com uma conexão do proprietário do banco. As URLs devem manter os parâmetros SSL fornecidos pelo Neon. Os arquivos `.env*` ficam fora do Git.

Execute `npm run db:migrate`. O comando aplica cada arquivo uma vez, em transação, com bloqueio e verificação de checksum para impedir conflitos entre execuções.

O banco começa vazio. `npm run db:seed:demo` insere o catálogo demonstrativo com `is_demo=true`, preservando os dados de produtos já existentes. Esse comando é opcional e deve ser utilizado apenas para demonstração.

Preços são armazenados em centavos inteiros. Estoque aceita inteiros não negativos. Produtos e categorias inativos ficam fora da loja. A sacola é limitada pelo estoque exibido, mas ainda não reserva unidades. Ao implementar pagamentos, será necessário validar os preços e reservar o estoque no servidor em uma transação.

Sem `DATABASE_URL`, a página mostra o catálogo demonstrativo anterior. Se uma conexão configurada falhar, a página mostra uma mensagem de indisponibilidade com opção de tentar novamente.

Execute `npm run test:db` para validar preços, estoque, repetição da carga demonstrativa e restrições do PostgreSQL usando PGlite.
