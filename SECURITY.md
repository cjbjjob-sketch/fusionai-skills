# Reporting a vulnerability

Send security reports privately to server@fusionai.tv. Include the affected version, reproduction steps and expected impact. Do not publish active API credentials, private media or exploitable account details in a public issue.

API keys are read from the environment. They are sent only to the configured API origin; API redirects are rejected. Result-image downloads use separate requests without API credentials, public HTTPS destinations and validated redirects.
