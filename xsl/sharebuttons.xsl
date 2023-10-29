<?xml version="1.0" encoding="UTF-8"?>
<!-- xmlns:tとした場合 -->
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:yc="urn:yaohata-components"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map"
  xpath-default-namespace="http://www.w3.org/1999/xhtml">
  <xsl:output method="xml" />

  <xsl:param name="param"/>
  <xsl:template match="yc:val" mode="#default">
    <xsl:variable name="name" select="@name"/>
    <xsl:value-of select="map:get($param,$name)"/>
  </xsl:template>
  
  <xsl:template match="@*">
    <xsl:attribute name="{name()}">
      <xsl:analyze-string select="." regex="#\{{.+?\}}">
        <xsl:matching-substring>
          <xsl:variable name="name" select="."/>
          <xsl:sequence select="map:get($param,$name)"/>
        </xsl:matching-substring>
        <xsl:non-matching-substring>
          <xsl:sequence select="."/>
        </xsl:non-matching-substring>
      </xsl:analyze-string>
    </xsl:attribute>
  </xsl:template>

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*" />
      <xsl:apply-templates />
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>