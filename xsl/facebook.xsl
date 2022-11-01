<?xml version="1.0" encoding="UTF-8"?>
<!-- xmlns:tとした場合 -->
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:t="urn:template"
  xpath-default-namespace="http://www.w3.org/1999/xhtml">
  <xsl:output method="xml" />

  <xsl:param name="url" />

  <xsl:template match="@t:href">
    <xsl:attribute name="href">
      <xsl:value-of select="concat('https://www.facebook.com/sharer/sharer.php?u=',encode-for-uri($url),'&amp;src=sdkpreparse')" />
    </xsl:attribute>
  </xsl:template>
  <xsl:template match="@t:data-href">
    <xsl:attribute name="href">
      <xsl:value-of select="$url" />
    </xsl:attribute>
  </xsl:template>
  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*" />
      <xsl:apply-templates />
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>