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
