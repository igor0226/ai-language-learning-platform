variable "domain_name" {
  description = "Public zone apex, for example example.com. This is the registered domain, not a child zone."
  type        = string
}

variable "environment_label" {
  description = "DNS label ahead of the service name. Records are <label>.app.<domain> and <label>.media.<domain>."
  type        = string
  default     = "dev"

  validation {
    condition     = can(regex("^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$", var.environment_label))
    error_message = "environment_label must be a single DNS label."
  }
}

variable "instance_type" {
  description = "Instance size for k3s and the full app stack."
  type        = string
  default     = "t4g.medium"
}

variable "instance_state" {
  description = "Power state of the practice instance. Set to stopped between sessions."
  type        = string
  default     = "running"

  validation {
    condition     = contains(["running", "stopped"], var.instance_state)
    error_message = "instance_state must be running or stopped."
  }
}
