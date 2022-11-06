<?xml version="1.0" encoding="UTF-8"?>
<!-- xmlns:tとした場合 -->
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:ogp="https://ogp.me/ns#"
  xmlns:yc="urn:yaohata-components"
  xmlns:fn="http://www.w3.org/2005/xpath-functions"
  xpath-default-namespace="http://www.w3.org/1999/xhtml">
  <xsl:output method="xml" />

  <xsl:param name="path" />
  <xsl:variable name="source" select="document($path,.)"></xsl:variable>
  <xsl:variable name="ogpprefix" select="yc:ogpprefix($source/html/@prefix)"/>

  <xsl:template match="@yc:url">
    <xsl:attribute name="href">
      <xsl:value-of select="$source//meta[@property = yc:check('url')]/@content"></xsl:value-of>
    </xsl:attribute>
  </xsl:template>
  <xsl:template match="@yc:image">
    <xsl:attribute name="src">
      <xsl:value-of select="$source//meta[@property = yc:check('image')]/@content"></xsl:value-of>
    </xsl:attribute>
  </xsl:template>
  <xsl:template match="yc:description">
    <xsl:value-of select="$source//meta[@property = yc:check('description')]/@content"></xsl:value-of>
  </xsl:template>
  <xsl:template match="yc:title">
    <xsl:value-of select="$source//meta[@property = yc:check('title')]/@content"></xsl:value-of>
  </xsl:template>

  <xsl:function name="yc:check">
    <xsl:param name="name"/>
    <xsl:message><xsl:value-of select="concat($ogpprefix,':',$name)"/></xsl:message>
    <xsl:sequence select="concat($ogpprefix,':',$name)"></xsl:sequence>
  </xsl:function>

  <xsl:function name="yc:ogpprefix">
    <xsl:param name="prefix"/>
    <xsl:analyze-string select="$prefix" regex=".+:\s*.+">
      <xsl:matching-substring>
        <xsl:if test="contains(.,'https://ogp.me/ns#')">
          <xsl:value-of select="substring-before(.,':')"/>
        </xsl:if>
      </xsl:matching-substring>
    </xsl:analyze-string>
  </xsl:function>

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*" />
      <xsl:apply-templates />
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>