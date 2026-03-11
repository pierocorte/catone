#!/bin/bash
cd ./agw3000 && pnpm install && pnpm start &
cd ./reg_csv_passive && pnpm install && pnpm start &
cd ./libs && pnpm install && pnpm start &
cd ./fe3020_registry && pnpm install && pnpm start &
cd ./FakeProcessPassiveRegistryRestReply && pnpm install && pnpm start &
wait
