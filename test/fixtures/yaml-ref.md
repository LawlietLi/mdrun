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

```bash cmd=deploy ref=deploy-meta
echo "Deploying to $env..."
if [ "$dry_run" = "true" ]; then
  echo "(dry run — no changes made)"
fi
```
