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
  ai_bots_protection = "disabled"
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

resource "cloudflare_ruleset" "prod_firewall" {
  kind        = "zone"
  name        = "Terraformed firewall"
  phase       = "http_request_firewall_custom"
  zone_id     = cloudflare_zone.prod_domain.id
  description = "Firewall managed by terraform"
  rules = [{
    action      = "managed_challenge"
    description = "Outdated protocol"
    enabled     = true
    expression  = "(http.request.version in {\"HTTP/1.0\" \"HTTP/1.1\" \"HTTP/1.2\"} and not cf.client.bot)"
  }]
}

resource "cloudflare_zone_setting" "prod_always_use_https" {
  zone_id    = cloudflare_zone.prod_domain.id
  setting_id = "always_use_https"
  value      = "on"
}

resource "cloudflare_zone_setting" "prod_min_tls_version" {
  zone_id    = cloudflare_zone.prod_domain.id
  setting_id = "min_tls_version"
  value      = "1.2"
}

resource "cloudflare_zone_setting" "prod_0rtt" {
  zone_id    = cloudflare_zone.prod_domain.id
  setting_id = "0rtt"
  value      = "on"
}
