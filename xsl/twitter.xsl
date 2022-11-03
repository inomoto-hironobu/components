<?xml version="1.0" encoding="UTF-8"?>
<!-- xmlns:tとした場合 -->
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:yc="urn:yaohata-components"
  xpath-default-namespace="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" />

  <xsl:param name="data-url" />

  <xsl:template match="@yc:data-url">
    <xsl:attribute name="data-url">
      <xsl:value-of select="$data-url" />
    </xsl:attribute>
  </xsl:template>

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*" />
      <xsl:apply-templates />
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>