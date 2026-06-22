# Plugin System

Diem mo rong hien co:

- `src/bootstrap/bootstrap-plugins.ts`
- `src/modules/plugins/*`

Flow implement de xuat:

1. Scan `plugins/`
2. Read `plugin.json`
3. Validate compatibility
4. Register APIs + hooks + permissions
5. Run migrations
