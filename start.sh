#!/bin/bash
cd ./agw3000 && pnpm start &
cd ./reg_csv_passive && pnpm start &
cd ./libs && pnpm start &
cd ./FakeProcessPassiveRegistryRestReply && pnpm start &
cd ./fe3020_registry && pnpm start &
wait
