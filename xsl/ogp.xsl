<?xml version="1.0" encoding="UTF-8"?>
<!-- xmlns:tとした場合 -->
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:yc="urn:yaohata-components"
  xmlns:ogp="https://ogp.me/ns#"
  xmlns:fn="http://www.w3.org/2005/xpath-functions"
  xpath-default-namespace="http://www.w3.org/1999/xhtml">
  <xsl:output method="xml" />

  <xsl:param name="path" />
  <xsl:variable name="target" select="document($path,.)"></xsl:variable>

  <xsl:template match="@yc:url">
    <xsl:attribute name="href">
      <xsl:value-of select="$target//meta[fn:resolve-QName(@property,.)=fn:QName('https://ogp.me/ns#','url')]/@content"></xsl:value-of>
    </xsl:attribute>
  </xsl:template>
  <xsl:template match="@yc:image">
    <xsl:attribute name="src">
      <xsl:value-of select="$target//meta[fn:resolve-QName(@property,.)=fn:QName('https://ogp.me/ns#','image')]/@content"></xsl:value-of>
    </xsl:attribute>
  </xsl:template>
  <xsl:template match="yc:description">
    <xsl:value-of select="$target//meta[fn:resolve-QName(@property,.)=fn:QName('https://ogp.me/ns#','description')]/@content"></xsl:value-of>
  </xsl:template>
  <xsl:template match="yc:title">
    <xsl:value-of select="$target//meta[fn:resolve-QName(@property,.)=fn:QName('https://ogp.me/ns#','title')]/@content"></xsl:value-of>
  </xsl:template>

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*" />
      <xsl:apply-templates />
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>