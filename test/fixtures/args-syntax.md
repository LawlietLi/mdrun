# Args syntax examples

```bash cmd=serve args=[-p/--port=<port>=3000] [--host=<host>=localhost] [--watch] desc=Start dev server
echo "Starting server on $host:$port"
if [ "$watch" = "true" ]; then echo "Watch mode enabled"; fi
```

```bash cmd=deploy args=(-d/--domain=<domain>) [--tag=<tag>=latest] [--dry-run] desc=Deploy to domain
echo "Deploying $tag to $domain"
```
