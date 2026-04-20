# Deploy

```yaml id=deploy-meta
desc: Deploy the application to an environment
confirm: Deploy to $env?
args:
  env:
    required: true
    desc: Target environment (staging/production)
  dry-run:
    type: boolean
    desc: Simulate deployment without making changes
```

```bash cmd=deploy spec=deploy-meta
echo "Deploying to $env..."
[ -n "$dry_run" ] && echo "(dry run — no changes made)"
```
