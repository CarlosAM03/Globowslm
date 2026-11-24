# Internal DNS is used only by the isolated harness stack.
if [ -n "${STACK_QA_PROJECT:-}" ]; then
  case "$STACK_QA_PROJECT" in
    globows-v2-[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f])
      APP_ORIGIN=http://web:3100
      CMS_MEDIA_ORIGIN=http://api:3101
      ;;
    *) echo "Proyecto de QA inválido" >&2; exit 1 ;;
  esac
else
  APP_ORIGIN="${APP_ORIGIN:-http://127.0.0.1:3100}"
  CMS_MEDIA_ORIGIN="${CMS_MEDIA_ORIGIN:-http://127.0.0.1:3101}"
fi
export APP_ORIGIN CMS_MEDIA_ORIGIN
