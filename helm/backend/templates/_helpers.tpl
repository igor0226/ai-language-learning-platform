{{- define "backend.image" -}}
{{ required "Set image.repository to the backend ECR repository" .Values.image.repository }}:{{ required "Set image.tag to the pushed image tag" .Values.image.tag }}
{{- end -}}

{{- define "backend.livekitCredentials" -}}
{{- range $key := list "LIVEKIT_API_KEY" "LIVEKIT_API_SECRET" }}
- name: {{ $key }}
  valueFrom:
    secretKeyRef:
      name: {{ $.Values.livekitSecret | quote }}
      key: {{ $key }}
{{- end }}
{{- end -}}

{{- define "backend.sharedCredentials" -}}
{{- range $key := list "OPENAI_API_KEY" "SPEAKING_INTERNAL_API_SECRET" }}
- name: {{ $key }}
  valueFrom:
    secretKeyRef:
      name: {{ $.Values.existingSecret | quote }}
      key: {{ $key }}
{{- end }}
{{- end -}}
