<?xml version="1.0" encoding="UTF-8"?>
<!-- xmlns:tとした場合 -->
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:yc="urn:yaohata-components"
  xmlns:fn="http://www.w3.org/2005/xpath-functions"
  xpath-default-namespace="http://www.w3.org/1999/xhtml">
  <xsl:output method="xml" />

  <xsl:param name="path" />
  <xsl:param name="target"/>
  <xsl:variable name="ref" select="document($path,.)"/>

  <xsl:template match="@yc:href">
    <xsl:attribute name="href">
      <xsl:value-of select="$path"/>
    </xsl:attribute>
  </xsl:template>
  <xsl:template match="yc:content">
    <xsl:copy-of select="$ref//*[@id=$target]/*"></xsl:copy-of>
  </xsl:template>
  <xsl:template match="yc:title">
    <xsl:value-of select="$ref/html/meta/title[1]"/>
  </xsl:template>

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*" />
      <xsl:apply-templates />
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>