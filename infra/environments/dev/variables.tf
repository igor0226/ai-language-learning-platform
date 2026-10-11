variable "instance_state" {
  description = "Power state of the practice instance. Set to stopped between sessions."
  type        = string
  default     = "running"

  validation {
    condition     = contains(["running", "stopped"], var.instance_state)
    error_message = "instance_state must be running or stopped."
  }
}
