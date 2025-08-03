terraform {
  cloud {
    hostname     = "app.terraform.io"
    organization = "Provided"
    workspaces {
      tags = ["prod"]
    }
  }

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "5.8.2"
    }
  }
}

resource "cloudflare_zone" "prod_domain" {
  account = {
    id = var.cloudflare_account_id
  }
  name = var.domain
}

resource "cloudflare_workers_custom_domain" "prod_worker_domain" {
  account_id  = cloudflare_zone.prod_domain.account.id
  environment = "production"
  hostname    = cloudflare_zone.prod_domain.name
  service     = "ddrp-production"
  zone_id     = cloudflare_zone.prod_domain.id
}

resource "cloudflare_workers_kv_namespace" "prod_messages_kv" {
  account_id = cloudflare_zone.prod_domain.account.id
  title      = "Prod ddrp messages"
}

resource "cloudflare_bot_management" "prod_bot_management" {
  zone_id            = cloudflare_zone.prod_domain.id
  ai_bots_protection = "block"
  crawler_protection = "enabled"
  fight_mode         = true
}

resource "cloudflare_ruleset" "prod_ratelimit" {
  kind        = "zone"
  name        = "Terraformed ratelimit"
  phase       = "http_ratelimit"
  zone_id     = cloudflare_zone.prod_domain.id
  description = "Rate limit managed by terraform"
  rules = [{
    action      = "block"
    description = "Remote function calls"
    expression  = "(http.request.uri.path wildcard \"/_app/remote/*\")"
    ratelimit = {
      characteristics     = ["ip.src", "cf.colo.id"]
      requests_to_origin  = false
      rate_exceeds        = "request_base"
      period              = 10
      mitigation_timeout  = 10
      requests_per_period = 5
    }
    customCounter = false
  }]
}
